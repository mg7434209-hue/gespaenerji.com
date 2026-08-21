/**
 * GESPA Enerji — sipariş ve ödeme uçları
 *
 * Uçlar (hepsi server.js tarafından yönlendirilir):
 *   GET  /api/odeme            → kartla ödeme açık mı (sepet arayüzü buna bakar)
 *   POST /api/siparis          → siparişi doğrula, fiyatı SUNUCUDA hesapla, kaydet;
 *                                kartlıysa iyzico ödeme sayfası adresini döndür
 *   POST /odeme/callback       → iyzico'nun ödeme dönüşü (token ile doğrulama)
 *   GET  /api/siparis-durumu   → sonuç sayfası için kısıtlı sipariş görünümü
 *
 * ALTIN KURAL: tutar istemciden ASLA kabul edilmez. Sepetten yalnızca ürün
 * kimliği ve adet alınır; fiyat assets/config.js'ten okunup burada hesaplanır.
 * Hesaplama kuralı main.js'teki pkgUnit ile birebir aynıdır (bkz. priceOf).
 */
"use strict";

const iyzico = require("./iyzico");
const orders = require("./orders");

const MAX_BODY = 64 * 1024;          // sipariş gövdesi için fazlasıyla yeterli
const MAX_QTY = 99;
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 12;                  // aynı IP'den dakikada en fazla sipariş denemesi

const rate = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const hits = (rate.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  rate.set(ip, hits);
  if (rate.size > 5000) rate.clear();  // basit tavan; bellek şişmesin
  return hits.length > RATE_MAX;
}

/* ---------- yardımcılar ---------- */

function json(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (d) => {
      raw += d;
      if (raw.length > MAX_BODY) { req.destroy(); reject(new Error("Gövde çok büyük")); }
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

function clientIp(req) {
  return (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    (req.socket && req.socket.remoteAddress) || "0.0.0.0";
}

function str(v, max) {
  return typeof v === "string" ? v.trim().slice(0, max || 200) : "";
}

/** Telefonu iyzico'nun beklediği +90XXXXXXXXXX biçimine getirir. */
function gsm(tel) {
  const d = String(tel || "").replace(/\D/g, "");
  if (d.length === 10) return "+90" + d;                 // 5xx...
  if (d.length === 11 && d[0] === "0") return "+90" + d.slice(1);
  if (d.length === 12 && d.slice(0, 2) === "90") return "+" + d;
  return d ? "+" + d : "";
}

/* ---------- fiyatlandırma (main.js pkgUnit ile AYNI kural) ---------- */

function priceOf(p, cfg) {
  const rate = cfg.usdTry || 0;
  const pct = cfg.cartDiscountPct || 0;
  const tl = p.currency === "USD" ? Math.round(p.price * rate / 100) * 100 : p.price;
  return {
    list: tl,
    cart: Math.round(tl * (100 - pct) / 100 / 50) * 50
  };
}

/**
 * Sepeti fiyatlandırır. Ödeme yöntemine göre ödenecek tutar:
 *   havale → %`cartDiscountPct` indirimli toplam
 *   kapida → liste toplamı (%30'u peşin havale, kalanı teslimatta)
 *   kart   → liste toplamı (havale indirimi kartta geçerli değildir)
 */
function priceCart(rawItems, method, cfg) {
  const packages = cfg.packages || [];
  const items = [];
  let listTotal = 0, cartTotal = 0;

  (Array.isArray(rawItems) ? rawItems : []).forEach((it) => {
    const p = packages.filter((x) => x.id === str(it && it.id, 60))[0];
    if (!p || p.price == null) return;
    const qty = Math.max(1, Math.min(MAX_QTY, parseInt(it.qty, 10) || 0));
    if (items.some((x) => x.id === p.id)) return;          // aynı ürün iki kez gelmesin
    const u = priceOf(p, cfg);
    items.push({
      id: p.id, sku: p.sku || p.id, name: p.name, qty: qty,
      unitList: u.list, unitCart: u.cart,
      sumList: u.list * qty, sumCart: u.cart * qty
    });
    listTotal += u.list * qty;
    cartTotal += u.cart * qty;
  });

  const payable = method === "havale" ? cartTotal : listTotal;
  const downPayment = method === "kapida" ? Math.round(listTotal * 0.30 / 50) * 50 : 0;

  return {
    items: items,
    totals: {
      list: listTotal,
      discounted: cartTotal,
      discountPct: cfg.cartDiscountPct || 0,
      payable: payable,
      downPayment: downPayment,
      onDelivery: method === "kapida" ? listTotal - downPayment : 0
    }
  };
}

/* ---------- doğrulama ---------- */

function validate(data, priced, cfg) {
  if (!priced.items.length) return "Sepetiniz boş görünüyor.";
  if (["havale", "kapida", "kart"].indexOf(data.method) < 0) return "Geçersiz ödeme yöntemi.";
  const c = data.customer || {};
  if (!c.name) return "Ad soyad gerekli.";
  if (!gsm(c.phone)) return "Geçerli bir telefon numarası girin.";
  if (!c.city) return "İl / ilçe gerekli.";
  if (!c.address || c.address.length < 10) return "Teslimat adresini eksiksiz yazın.";
  if (!data.consent) return "Satış şartlarını onaylamanız gerekiyor.";
  if (data.method === "kart") {
    if (!iyzico.enabled() || !(cfg.payment && cfg.payment.enabled)) return "Kartla ödeme şu anda kullanılamıyor.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email || "")) return "Kartla ödeme için e-posta adresi gerekli.";
    if (priced.totals.payable <= 0) return "Ödenecek tutar hesaplanamadı.";
  }
  return null;
}

/* ---------- uçlar ---------- */

async function postOrder(req, res, ctx) {
  const ip = clientIp(req);
  if (rateLimited(ip)) return json(res, 429, { ok: false, error: "Çok fazla deneme yaptınız, biraz sonra tekrar deneyin." });

  let data;
  try { data = JSON.parse(await readBody(req)); }
  catch (e) { return json(res, 400, { ok: false, error: "İstek okunamadı." }); }

  const cfg = ctx.config();
  const method = str(data && data.method, 20);
  const priced = priceCart(data && data.items, method, cfg);

  const customer = {
    name: str(data.customer && data.customer.name, 120),
    phone: str(data.customer && data.customer.phone, 40),
    email: str(data.customer && data.customer.email, 160).toLowerCase(),
    city: str(data.customer && data.customer.city, 120),
    address: str(data.customer && data.customer.address, 600),
    note: str(data.customer && data.customer.note, 400)
  };

  const err = validate({ method: method, customer: customer, consent: !!(data && data.consent) }, priced, cfg);
  if (err) return json(res, 400, { ok: false, error: err });

  const order = orders.create({
    method: method,
    locale: str(data.locale, 5) || "tr",
    items: priced.items,
    totals: priced.totals,
    customer: customer,
    status: method === "kart" ? "odeme-bekliyor" : "bekliyor",
    meta: { ip: ip, ua: str(req.headers["user-agent"], 300) }
  });

  // Havale / kapıda: kayıt yeter, sepet WhatsApp mesajını kendisi açar
  if (method !== "kart") {
    return json(res, 200, { ok: true, code: order.code, method: method, total: priced.totals.payable });
  }

  // Kartlı ödeme: iyzico ödeme sayfasını başlat
  try {
    const base = ctx.siteOrigin(req);
    const nameParts = customer.name.split(/\s+/);
    const surname = nameParts.length > 1 ? nameParts.pop() : "-";
    const buyerAddress = customer.address + " / " + customer.city;

    const init = await iyzico.initializeCheckoutForm({
      locale: order.locale === "tr" ? "tr" : "en",
      conversationId: order.code,
      basketId: order.code,
      price: priced.totals.payable,
      paidPrice: priced.totals.payable,
      currency: (cfg.payment && cfg.payment.currency) || "TRY",
      enabledInstallments: (cfg.payment && cfg.payment.installments) || [1],
      callbackUrl: base + "/odeme/callback",
      buyer: {
        id: order.code,
        name: nameParts.join(" ") || customer.name,
        surname: surname,
        // iyzico bu alanı zorunlu tutar ama standart e-ticarette doğrulamaz.
        // TC kimlik numarası TOPLAMIYORUZ (gereksiz kişisel veri) — yer tutucu
        // gönderilir. Gerçekten gerekirse config.payment.identityNumber ile ezilir.
        identityNumber: (cfg.payment && cfg.payment.identityNumber) || "11111111111",
        email: customer.email,
        gsmNumber: gsm(customer.phone),
        registrationAddress: buyerAddress,
        city: customer.city,
        country: "Turkey",
        ip: ip
      },
      shippingAddress: { contactName: customer.name, address: buyerAddress, city: customer.city, country: "Turkey" },
      billingAddress: { contactName: customer.name, address: buyerAddress, city: customer.city, country: "Turkey" },
      basketItems: priced.items.map((i) => ({
        // Sepette adet vardır, iyzico'da yoktur: satır toplamı tek kalem yazılır
        id: i.sku, name: i.name + (i.qty > 1 ? " × " + i.qty : ""),
        category1: "Solar", itemType: "PHYSICAL",
        price: method === "havale" ? i.sumCart : i.sumList
      }))
    });

    if (!init || init.status !== "success" || !init.paymentPageUrl) {
      const msg = (init && (init.errorMessage || init.errorCode)) || "Ödeme başlatılamadı.";
      orders.update(order.code, { status: "basarisiz", payment: { provider: "iyzico", errorMessage: String(msg) } });
      return json(res, 502, { ok: false, code: order.code, error: "Ödeme başlatılamadı: " + msg });
    }

    orders.update(order.code, {
      payment: { provider: "iyzico", token: init.token, sandbox: iyzico.isSandbox(), startedAt: new Date().toISOString() }
    });
    return json(res, 200, { ok: true, code: order.code, method: "kart", paymentPageUrl: init.paymentPageUrl });
  } catch (e) {
    orders.update(order.code, { status: "basarisiz", payment: { provider: "iyzico", errorMessage: String(e && e.message) } });
    return json(res, 502, { ok: false, code: order.code, error: "Ödeme sağlayıcısına ulaşılamadı. Lütfen tekrar deneyin." });
  }
}

/**
 * iyzico ödeme dönüşü. iyzico buraya form gönderimiyle `token` bırakır;
 * ödemenin GERÇEKTEN başarılı olduğu YALNIZCA token'ı iyzico'ya sorarak
 * doğrulanır — gelen gövdedeki hiçbir alana güvenilmez.
 */
async function paymentCallback(req, res) {
  let token = "", conversationId = "";
  try {
    const raw = await readBody(req);
    const params = new URLSearchParams(raw);
    token = params.get("token") || "";
    conversationId = params.get("conversationId") || "";
  } catch (e) { /* aşağıda hata sayfasına düşer */ }

  const done = (durum, kod) => {
    res.writeHead(303, { Location: "/odeme-sonuc.html?durum=" + durum + (kod ? "&kod=" + encodeURIComponent(kod) : ""), "Cache-Control": "no-store" });
    res.end();
  };

  if (!token) return done("hata", conversationId);

  let result;
  try { result = await iyzico.retrieveCheckoutForm(token, conversationId); }
  catch (e) { return done("hata", conversationId); }

  const code = orders.isCode(result && result.basketId) ? result.basketId
    : (orders.isCode(conversationId) ? conversationId : null);
  const order = code ? orders.read(code) : null;
  if (!order) return done("hata", code);

  // Zaten sonuçlanmış siparişi yeniden işleme (iyzico callback'i tekrarlayabilir)
  if (order.status === "odendi") return done("basarili", order.code);

  const paid = result && result.status === "success" && result.paymentStatus === "SUCCESS";
  // Tutar denetimi: iyzico'nun tahsil ettiği tutar bizim beklediğimizle aynı mı?
  const expected = iyzico.formatPrice(order.totals.payable);
  const charged = iyzico.formatPrice(result && result.paidPrice);
  const amountOk = paid && parseFloat(charged) === parseFloat(expected);

  const payment = Object.assign({}, order.payment, {
    provider: "iyzico",
    token: token,
    paymentId: (result && result.paymentId) || null,
    iyzicoStatus: (result && result.paymentStatus) || (result && result.status) || null,
    paidPrice: (result && result.paidPrice) || null,
    installment: (result && result.installment) || null,
    cardAssociation: (result && result.cardAssociation) || null,
    lastFour: (result && result.lastFourDigits) || null,
    errorMessage: paid && !amountOk ? "Tahsil edilen tutar sipariş tutarıyla uyuşmuyor"
      : (result && result.errorMessage) || null,
    finishedAt: new Date().toISOString()
  });

  if (paid && amountOk) {
    orders.update(order.code, { status: "odendi", payment: payment });
    return done("basarili", order.code);
  }
  orders.update(order.code, { status: "basarisiz", payment: payment });
  return done("basarisiz", order.code);
}

function orderStatus(req, res, query) {
  const code = query.get("kod") || "";
  if (!orders.isCode(code)) return json(res, 400, { ok: false, error: "Geçersiz sipariş kodu." });
  const order = orders.read(code);
  if (!order) return json(res, 404, { ok: false, error: "Sipariş bulunamadı." });
  return json(res, 200, { ok: true, order: orders.publicView(order) });
}

function paymentInfo(res, ctx) {
  const cfg = ctx.config();
  const on = !!(cfg.payment && cfg.payment.enabled) && iyzico.enabled();
  return json(res, 200, {
    enabled: on,
    provider: "iyzico",
    sandbox: on ? iyzico.isSandbox() : false,
    installments: (cfg.payment && cfg.payment.installments) || [1]
  });
}

/**
 * server.js'ten çağrılır. İsteği bu modül karşıladıysa true döner.
 * ctx = { config(), siteOrigin(req) }
 */
function handle(req, res, urlPath, query, ctx) {
  if (urlPath === "/api/odeme" && req.method === "GET") { paymentInfo(res, ctx); return true; }
  if (urlPath === "/api/siparis" && req.method === "POST") {
    postOrder(req, res, ctx).catch(() => json(res, 500, { ok: false, error: "Sipariş alınamadı." }));
    return true;
  }
  if (urlPath === "/odeme/callback" && req.method === "POST") {
    paymentCallback(req, res).catch(() => {
      res.writeHead(303, { Location: "/odeme-sonuc.html?durum=hata", "Cache-Control": "no-store" });
      res.end();
    });
    return true;
  }
  if (urlPath === "/api/siparis-durumu" && req.method === "GET") { orderStatus(req, res, query); return true; }
  return false;
}

module.exports = { handle, priceCart, priceOf, gsm };
