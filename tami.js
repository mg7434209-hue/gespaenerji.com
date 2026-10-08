/* tami (Garanti BBVA Ödeme Sistemleri) sanal POS istemcisi — bağımlılıksız.
   Akış (3D'li satış, API v3):
     1) POST {TAMI_BASE_URL}/payment/auth  → threeDSHtmlContent (base64 HTML)
        müşterinin tarayıcısında açılır, banka 3D sayfasına kendiliğinden gider.
     2) Banka → tami → tarayıcı callbackUrl'imize döner (3D doğrulama cevabı);
        hashedData HMAC-SHA256(secretKey) ile doğrulanır.
     3) 3D tamamlama isteği (orderId + securityHash) satışı kesinleştirir.
   ANAHTARLAR YALNIZ ENV'DEN: TAMI_MERCHANT_NUMBER · TAMI_TERMINAL_NUMBER ·
   TAMI_SECRET_KEY · TAMI_KID · TAMI_K · TAMI_BASE_URL (sandbox:
   https://sandbox-paymentapi.tami.com.tr). Repoya/konfige ASLA yazılmaz.
   KART VERİSİ (numara, SKT, CVV) yalnız bellekte tami isteğine konur; log'a,
   orders.json'a, e-postaya YAZILMAZ. Kayda yalnız maskeli numara girer.

   Kaynak: tami resmî kod örnekleri (NodeJS/PHP/Java/C#, securityHashV3).
   gesmarketim1 reposundaki tami.js ile AYNI dosyadır (orada önce yazıldı);
   birinde düzeltme yaparsan ötekine de taşı.
   Env eksikse ready() false döner, kart seçeneği tami yoluyla AÇILMAZ. */
"use strict";
const crypto = require("crypto");
const http = require("http");
const https = require("https");

const cfg = {
  merchant: String(process.env.TAMI_MERCHANT_NUMBER || "").trim(),
  terminal: String(process.env.TAMI_TERMINAL_NUMBER || "").trim(),
  secret: String(process.env.TAMI_SECRET_KEY || "").trim(),
  kid: String(process.env.TAMI_KID || "").trim(),   // örneklerde fixedKidValue
  k: String(process.env.TAMI_K || "").trim(),       // örneklerde fixedKValue (base64url)
  base: String(process.env.TAMI_BASE_URL || "").trim().replace(/\/+$/, "")
};

const PATHS = {
  auth: "/payment/auth",
  complete: "/payment/complete-3ds",
  installment: "/installment/installment-info"
};

// PG-Auth-Token = merchantNumber:terminalNumber:base64(sha256(m + t + secretKey))
// (tami "Hash Hesaplama": Java örneği printBase64Binary kullanır — hex DEĞİL)
function authToken() {
  const hash = crypto.createHash("sha256")
    .update(cfg.merchant + cfg.terminal + cfg.secret, "utf8").digest("base64");
  return cfg.merchant + ":" + cfg.terminal + ":" + hash;
}

// İstek securityHash'i = JWS (HS512): header {alg,typ,kid} · payload = gövdenin
// securityHash ALANI HARİÇ JSON metni · anahtar = base64url-çözülmüş k.
// Gövde aynı anahtar sırasıyla gönderilir; securityHash en sona eklenir.
const b64u = (buf) => buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64uDecode = (s) => Buffer.from(String(s).replace(/-/g, "+").replace(/_/g, "/"), "base64");
function securityHash(body) {
  const header = b64u(Buffer.from(JSON.stringify({ alg: "HS512", typ: "JWT", kid: cfg.kid }), "utf8"));
  const payload = b64u(Buffer.from(JSON.stringify(body), "utf8"));
  const sig = crypto.createHmac("sha512", b64uDecode(cfg.k)).update(header + "." + payload, "utf8").digest();
  return header + "." + payload + "." + b64u(sig);
}

function ready() {
  return Boolean(cfg.merchant && cfg.terminal && cfg.secret && cfg.kid && cfg.k && cfg.base);
}

function post(pathName, body, cb) {
  let u;
  try { u = new URL(cfg.base + pathName); } catch (e) { return cb(null); }
  const payload = JSON.stringify(body);
  const mod = u.protocol === "https:" ? https : http;
  // correlationId log'a yazılır: tami destek isteği bununla bulur
  const meta = { cid: "GM" + crypto.randomUUID(), status: 0 };
  let bitti = false;
  const done = (j) => { if (!bitti) { bitti = true; cb(j, meta); } };
  const rq = mod.request(u, { method: "POST", headers: {
    "Content-Type": "application/json",
    "Accept-Language": "tr",
    "Content-Length": Buffer.byteLength(payload),
    correlationId: meta.cid,
    "PG-Auth-Token": authToken(),
    "PG-Api-Version": "v3"
  }}, (r) => {
    meta.status = r.statusCode;
    let b = "";
    r.on("data", (c) => { b += c; if (b.length > 2097152) rq.destroy(); });
    r.on("end", () => { let j; try { j = JSON.parse(b); } catch (e) { j = null; } done(j); });
    r.on("error", () => done(null));
  });
  rq.setTimeout(25000, () => rq.destroy());
  rq.on("error", () => done(null));
  rq.on("close", () => setImmediate(() => done(null)));
  rq.end(payload);
}

/* ---------- Kart doğrulama (gönderimden önce, sunucuda) ---------- */
function luhn(d) {
  let s = 0, alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = d.charCodeAt(i) - 48;
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    s += n; alt = !alt;
  }
  return s % 10 === 0;
}
// → { card } ya da { error }
function checkCard(c, now = new Date()) {
  if (!c || typeof c !== "object") return { error: "Kart bilgileri eksik." };
  const number = String(c.number || "").replace(/[\s-]/g, "");
  const holderName = String(c.holderName || "").trim().replace(/\s+/g, " ");
  const cvv = String(c.cvv || "").trim();
  const ay = parseInt(c.expireMonth, 10);
  let yil = parseInt(c.expireYear, 10);
  if (yil < 100) yil += 2000;
  if (holderName.length < 3 || holderName.length > 30) return { error: "Kart üzerindeki adı yazın (en çok 30 karakter)." };
  if (!/^\d{12,19}$/.test(number) || !luhn(number)) return { error: "Kart numarası geçersiz." };
  if (!(ay >= 1 && ay <= 12) || !(yil >= 2000 && yil <= 2100)) return { error: "Son kullanma tarihi geçersiz." };
  const simdi = now.getFullYear() * 12 + now.getMonth() + 1;
  if (yil * 12 + ay < simdi) return { error: "Kartın son kullanma tarihi geçmiş." };
  if (!/^\d{3,4}$/.test(cvv)) return { error: "CVV geçersiz (kartın arkasındaki 3 hane)." };
  return { card: { holderName, cvv, expireMonth: ay, expireYear: yil, number } };
}

/* ---------- 3D başlatma gövdesi ---------- */
const para = (n) => Math.round(n * 100) / 100;
// order (tutar SUNUCUDA hesaplanmıştır): { no, total, shipping?, items:[{id,
// name, qty, tl}], name, phone, email, city?, addr, company? } → gövde ya da null
// Vade farkı %: işletmenin n taksitteki NET'i tek çekimdeki net'e eşit olsun
// (komisyon vade farkından da kesildiği için düz fark yetmez). Kuruşa yukarı.
function farkPct(n, taksitCfg) {
  const k = (taksitCfg && taksitCfg.komisyonPct) || {};
  const c1 = Number(k[1]) || 0, cn = Number(k[n]);
  if (!(n > 1) || !(cn >= 0) || cn >= 100) return 0;
  const f = ((1 - c1 / 100) / (1 - cn / 100) - 1) * 100;
  return f > 0 ? Math.ceil(f * 100 - 1e-9) / 100 : 0;
}
// Taksit tutarı: vade farkı = taban × fark% / 100 (kuruşa yuvarlı). Sepet
// sayfası AYNI formülü gösterir (frontend Cart.jsx taksitTutar).
function taksitTutar(taban, n, taksitCfg) {
  if (!(n > 1)) return { n: 1, fark: 0, toplam: para(taban) };
  const t = taksitCfg || {};
  if (!(t.secenekler || []).includes(n)) return null;
  const pct = farkPct(n, t);
  const fark = Math.round(taban * pct) / 100; // Cart.jsx ile AYNI
  return { n, fark, pct, toplam: para(taban + fark) };
}
// installment-info yanıtını sadeleştir (Java modelinde alan "installment"
// olarak da serileşebildiği için ikisi de okunur).
function taksitBilgi(j) {
  if (!j || !truthy(j.success ?? true)) return null;
  return {
    taksit: truthy(j.isInstallment ?? j.installment),
    banka: String(j.bankName || ""), tip: String(j.cardType || ""),
    org: String(j.cardOrg || ""), program: String(j.rewardType || "")
  };
}

// Alan sınırları tami "İstek Parametreleri" tablosundan: ürün adı/itemId 50,
// contactName/ad/soyad 30, adres 400. unitPrice × numberOfProducts = totalPrice
// ve kalemler toplamı = amount olmalı. İsteğe bağlı identityNumber ile
// registration/lastLoginDate (biçimi örneklerle çelişiyor) GÖNDERİLMEZ.
const kes = (v, n) => String(v || "").trim().slice(0, n);
function authBody(order, card, { orderId, ip, callbackUrl, taksit }) {
  const items = order.items.map((it) => ({
    itemId: kes(it.id, 50), name: kes(it.name, 50),
    itemType: "PHYSICAL", category: "Solar",
    numberOfProducts: it.qty, unitPrice: para(it.tl), totalPrice: para(para(it.tl) * it.qty)
  }));
  if (order.shipping > 0) items.push({ itemId: "kargo", name: "Kargo", itemType: "PHYSICAL",
    category: "Hizmet", numberOfProducts: 1, unitPrice: para(order.shipping), totalPrice: para(order.shipping) });
  const toplam = para(items.reduce((s, i) => s + i.totalPrice, 0));
  if (toplam !== para(order.total)) return null; // sepet ≠ tutar → gönderme
  const tk = taksit || { n: 1, fark: 0 };
  if (tk.fark > 0) items.push({ itemId: "vade-farki", name: "Vade farkı (" + tk.n + " taksit)",
    itemType: "VIRTUAL", category: "Hizmet", numberOfProducts: 1, unitPrice: tk.fark, totalPrice: tk.fark });

  const parca = String(order.name).trim().split(/\s+/);
  const name = kes(parca.length > 1 ? parca.slice(0, -1).join(" ") : parca[0], 30);
  const surName = kes(parca.length > 1 ? parca[parca.length - 1] : "-", 30);
  // GSM: örneklerdeki gibi başında 0 ile 11 hane (05xxxxxxxxx)
  const d10 = String(order.phone || "").replace(/\D/g, "").slice(-10);
  const phone = d10.length === 10 ? "0" + d10 : d10;
  const email = order.email || "";
  const city = order.city || "Belirtilmedi";
  const adres = { address: kes(order.addr, 400), city: kes(city, 30), companyName: kes(order.company, 100),
    country: "Türkiye", district: "", contactName: kes(order.name, 30), phoneNumber: phone, zipCode: "" };
  return {
    orderId, amount: para(order.total + tk.fark), callbackUrl, currency: "TRY",
    installmentCount: tk.n, motoInd: false, paymentGroup: "PRODUCT", paymentChannel: "WEB",
    card,
    billingAddress: { ...adres, emailAddress: email },
    shippingAddress: { ...adres, emailAddress: email },
    buyer: {
      ipAddress: ip, buyerId: kes(order.no, 50), name, surName,
      city, country: "Türkiye", zipCode: "", emailAddress: email, phoneNumber: phone,
      registrationAddress: kes(order.addr, 400)
    },
    basket: { basketId: order.no, basketItems: items }
  };
}

/* ---------- 3D doğrulama cevabı: hashedData ---------- */
// data = cardOrg + cardBrand + cardType + maskedNumber + installmentCount +
//        currency + originalAmount + orderId + systemTime + status
// hashedData = base64(HMAC-SHA256(secretKey, data))
function responseHash(f) {
  const data = String(f.cardOrganization ?? "") + String(f.cardBrand ?? "") + String(f.cardType ?? "") +
    String(f.maskedNumber ?? "") + String(f.installmentCount ?? "") + String(f.currency ?? "") +
    String(f.amount ?? "") + String(f.orderId ?? "") + String(f.systemTime ?? "") + String(f.status ?? "");
  return crypto.createHmac("sha256", cfg.secret).update(data, "utf8").digest("base64");
}
const esit = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
// Doküman tutar ve para birimi metninin biçimini vermiyor (10 / 10.0 / 10.00;
// TRY / 949): makul biçimlerin her biri denenir. Gizli anahtar olmadan hiçbiri
// üretilemeyeceği için bu, güvenliği zayıflatmaz.
function verifyCallback(cb, pending) {
  if (!cfg.secret || !cb || !cb.hashedData) return false;
  const n = Number(pending.amount);
  const tutarlar = [...new Set([String(cb.txnAmount ?? ""), String(n), n.toFixed(2), n.toFixed(1)].filter(Boolean))];
  const kurlar = [...new Set([String(cb.currencyCode ?? ""), pending.currency || "TRY"].filter(Boolean))];
  for (const amount of tutarlar) for (const currency of kurlar) {
    const h = responseHash({
      cardOrganization: cb.cardOrganization, cardBrand: cb.cardBrand, cardType: cb.cardType,
      maskedNumber: cb.maskedNumber, installmentCount: cb.installmentCount ?? pending.installmentCount,
      currency, amount, orderId: cb.orderId, systemTime: cb.systemTime, status: cb.success
    });
    if (esit(h, cb.hashedData)) return true;
  }
  return false;
}

const truthy = (v) => v === true || String(v).toLowerCase() === "true";
// Hata satırı (log): HTTP durumu · kod · grup · mesaj · correlationId. Kart verisi İÇERMEZ.
function hataOzet(j, meta) {
  const m = meta || {};
  if (!j) return "yanıt yok/JSON değil · HTTP " + (m.status || "-") + " · cid=" + (m.cid || "-");
  return ["HTTP " + (m.status || "-"), j.errorCode, j.errorGroup, j.errorMessage]
    .filter(Boolean).join(" · ") + " · cid=" + (m.cid || "-");
}

module.exports = {
  cfg, PATHS, authToken, securityHash, ready,
  post, checkCard, luhn, authBody, responseHash, verifyCallback, truthy, taksitTutar, taksitBilgi, farkPct, hataOzet
};
