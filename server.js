/**
 * GESPA Enerji — basit statik dosya sunucusu (Railway için)
 * Bağımlılık gerektirmez: Node.js'in yerleşik http/fs modülleriyle çalışır.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

// Sıkıştırılması anlamlı (metin tabanlı) içerik tipleri
const COMPRESSIBLE = /^(text\/|application\/(javascript|json|manifest\+json|xml)|image\/svg)/;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function safeJoin(base, target) {
  const targetPath = path.normalize(path.join(base, target));
  // Ayırıcı dahil önek kontrolü: '/base-evil' gibi kardeş yollar da elenir
  if (targetPath !== base && !targetPath.startsWith(base + path.sep)) return null;
  return targetPath;
}

// ---- Ziyaretçi sayacı ----
// Gerçek ziyaretleri sayar: HTML sayfası isteyen ve çerezi olmayan her tarayıcı
// günde 1 kez sayılır (çerez 24 saat yaşar); bilinen botlar sayılmaz.
// Toplam DATA_DIR/visitors.json dosyasında kalıcıdır (Railway'de Volume bağlanıp
// DATA_DIR verilirse dağıtımlar arası korunur; yoksa dağıtımda sıfırlanabilir —
// gösterilen toplamın tabanı config.visitors.base olduğundan site sayacı geriye
// düşmez, base güncellenerek taşınır). Footer rozeti /api/visitors'tan okur.
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, "data");
const VISIT_FILE = path.join(DATA_DIR, "visitors.json");
const VISIT_COOKIE = "gespa_v";
const ONLINE_WINDOW_MS = 5 * 60 * 1000; // son 5 dk içinde istek atan = "şu an sitede"
const BOT_RE = /bot|crawl|spider|slurp|preview|scan|monitor|probe|fetch|curl|wget|python|node-fetch|axios|headless|lighthouse|pingdom|facebookexternal|whatsapp|telegram/i;
let visitTotal = 0;
try { visitTotal = +JSON.parse(fs.readFileSync(VISIT_FILE, "utf8")).total || 0; } catch (e) {}
let visitSaveTimer = null;
function saveVisits() {
  if (visitSaveTimer) return; // yazımlar 2 sn'de bire toplanır
  visitSaveTimer = setTimeout(() => {
    visitSaveTimer = null;
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(VISIT_FILE, JSON.stringify({ total: visitTotal, saved: new Date().toISOString() }));
    } catch (e) {}
  }, 2000);
}
const onlineMap = new Map(); // ip → son istek zamanı
function onlineCount() {
  const now = Date.now();
  onlineMap.forEach((t, k) => { if (now - t > ONLINE_WINDOW_MS) onlineMap.delete(k); });
  return onlineMap.size;
}
function countVisit(req, headers) {
  try {
    const ua = req.headers["user-agent"] || "";
    if (!ua || BOT_RE.test(ua)) return;
    const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
      (req.socket && req.socket.remoteAddress) || "?";
    onlineMap.set(ip, Date.now());
    if (new RegExp("(^|;\\s*)" + VISIT_COOKIE + "=1").test(req.headers.cookie || "")) return; // son 24 saatte sayıldı
    visitTotal++;
    saveVisits();
    headers["Set-Cookie"] = VISIT_COOKIE + "=1; Max-Age=86400; Path=/; SameSite=Lax";
  } catch (e) {}
}

// ---- iyzico ödeme (kredi kartı) ----
// Anahtarlar YALNIZCA ortam değişkeninden okunur (Railway → Variables):
//   IYZIPAY_API_KEY, IYZIPAY_SECRET_KEY, IYZIPAY_BASE_URL
//   (sandbox: https://sandbox-api.iyzipay.com · canlı: https://api.iyzipay.com)
// IYZICO_* adlandırması da kabul edilir: firma adı "iyzico", API alan adı
// "iyzipay" olduğu için panelde ikisi karışabiliyor. Her iki ad da okunur;
// IYZIPAY_* tanımlıysa o önceliklidir.
// Anahtar tanımlı değilse /api/pay/status {enabled:false} döner ve sepetteki
// kart seçeneği "çok yakında" olarak kalır — kod yayında ama pasiftir.
// Tutarlar SUNUCUDA config'ten hesaplanır (istemciden fiyat kabul edilmez).
// Bekleyen/tamamlanan siparişler DATA_DIR/orders.json dosyasında tutulur.
const crypto = require("crypto");
const vm = require("vm");
const envKey = (...names) => {
  for (const n of names) { const v = (process.env[n] || "").trim(); if (v) return v; }
  return "";
};
const IYZ = {
  apiKey: envKey("IYZIPAY_API_KEY", "IYZICO_API_KEY"),
  secret: envKey("IYZIPAY_SECRET_KEY", "IYZICO_SECRET_KEY"),
  base: envKey("IYZIPAY_BASE_URL", "IYZICO_BASE_URL") || "https://sandbox-api.iyzipay.com"
};
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
function loadSiteConfig() {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "assets/config.js"), "utf8"), sandbox);
  return sandbox.window.GESPA.config;
}
let SITE_CFG = null;
try { SITE_CFG = loadSiteConfig(); } catch (e) { console.warn("config yüklenemedi:", e && e.message); }

function readOrders() { try { return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8")); } catch (e) { return {}; } }
function writeOrder(token, data) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const all = readOrders();
    all[token] = Object.assign(all[token] || {}, data);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(all, null, 1));
  } catch (e) { console.warn("sipariş yazılamadı:", e && e.message); }
}

// Birim TL fiyat — assets/main.js pkgUnit ile AYNI kural (liste fiyatı).
// Kart ödemesinde havale indirimi uygulanmaz; liste fiyatı tahsil edilir.
function pkgListTL(p, cfg) {
  const RATE = cfg.usdTry || 0;
  return p.currency === "USD" ? Math.round(p.price * RATE / 100) * 100 : p.price;
}

// Fiyat biçimi — resmî SDK ile aynı: tam sayıya ".0" eklenir ("50" -> "50.0")
function iyzPrice(n) { const v = String(n); return v.indexOf(".") < 0 ? v + ".0" : v; }

// iyzico REST — IYZWSv2 imzalı istek (resmî SDK'siz; bağımlılıksız sunucu korunur)
function iyzRequest(uriPath, body, cb) {
  const reqBody = JSON.stringify(body);
  const rnd = Date.now() + "123456789";
  const signature = crypto.createHmac("sha256", IYZ.secret)
    .update(rnd + uriPath + reqBody).digest("hex");
  const auth = "IYZWSv2 " + Buffer.from(
    "apiKey:" + IYZ.apiKey + "&randomKey:" + rnd + "&signature:" + signature
  ).toString("base64");
  const u = new URL(IYZ.base + uriPath);
  const opts = {
    method: "POST", hostname: u.hostname, port: u.port || 443, path: u.pathname,
    headers: {
      "Authorization": auth, "x-iyzi-rnd": rnd,
      "Content-Type": "application/json", "Content-Length": Buffer.byteLength(reqBody)
    }
  };
  const rq = require("https").request(opts, (rs) => {
    let d = "";
    rs.on("data", (c) => { d += c; });
    rs.on("end", () => { try { cb(null, JSON.parse(d)); } catch (e) { cb(new Error("iyzico yanıtı çözülemedi")); } });
  });
  rq.on("error", (e) => cb(e));
  rq.setTimeout(20000, () => { rq.destroy(new Error("iyzico zaman aşımı")); });
  rq.end(reqBody);
}

function readBody(req, limit, cb) {
  let d = "", over = false;
  req.on("data", (c) => { d += c; if (d.length > limit) { over = true; req.destroy(); } });
  req.on("end", () => { if (!over) cb(d); });
  req.on("error", () => {});
}
function sendJson(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
}
function siteOrigin(req) {
  const host = (req.headers.host || "").toLowerCase();
  const proto = req.headers["x-forwarded-proto"] || "http";
  return proto + "://" + host;
}

function handlePayRoutes(req, res, urlPath) {
  if (urlPath === "/api/pay/status") {
    return sendJson(res, 200, { enabled: !!(IYZ.apiKey && IYZ.secret) }), true;
  }
  if (urlPath === "/api/pay/checkout" && req.method === "POST") {
    if (!(IYZ.apiKey && IYZ.secret)) return sendJson(res, 503, { error: "Kart ödemesi şu anda kapalı." }), true;
    readBody(req, 64 * 1024, (raw) => {
      let b; try { b = JSON.parse(raw); } catch (e) { return sendJson(res, 400, { error: "Geçersiz istek." }); }
      let cfg; try { cfg = SITE_CFG || (SITE_CFG = loadSiteConfig()); } catch (e) { return sendJson(res, 500, { error: "Sunucu yapılandırması okunamadı." }); }
      const items = Array.isArray(b.items) ? b.items : [];
      const buyer = b.buyer || {};
      const lines = [];
      items.forEach((it) => {
        const p = (cfg.packages || []).find((x) => x.id === it.id);
        const qty = Math.max(1, Math.min(99, parseInt(it.qty, 10) || 0));
        if (p && qty) lines.push({ p, qty, unit: pkgListTL(p, cfg) });
      });
      if (!lines.length) return sendJson(res, 400, { error: "Sepet boş veya ürünler tanınamadı." });
      const nm = String(buyer.ad || "").trim().split(/\s+/);
      const surname = nm.length > 1 ? nm.pop() : "-";
      const name = nm.join(" ") || "-";
      const tel = String(buyer.tel || "").replace(/[^\d+]/g, "");
      const email = String(buyer.eposta || "").trim() || (cfg.company && cfg.company.email) || "";
      const tckn = String(buyer.tckn || "").replace(/\D/g, "");
      const adres = String(buyer.adres || "").trim();
      const il = String(buyer.il || "").trim();
      if (!name || !tel || !adres || !il) return sendJson(res, 400, { error: "Ad, telefon, il ve adres zorunludur." });
      if (!/^\d{11}$/.test(tckn)) return sendJson(res, 400, { error: "Kart ödemesi için 11 haneli T.C. kimlik numarası gereklidir." });
      const total = lines.reduce((a, l) => a + l.unit * l.qty, 0);
      const convId = "GES" + Date.now().toString(36).toUpperCase();
      const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim() || "85.34.78.112";
      const addr = {
        contactName: (name + " " + surname).trim(), city: il.split("/")[0].trim() || "Antalya",
        country: "Turkey", address: adres + " " + il
      };
      const payload = {
        locale: "tr", conversationId: convId,
        price: iyzPrice(total), paidPrice: iyzPrice(total), currency: "TRY",
        basketId: convId, paymentGroup: "PRODUCT",
        callbackUrl: siteOrigin(req) + "/api/pay/callback",
        buyer: {
          id: "B" + Date.now(), name: name, surname: surname,
          gsmNumber: tel.startsWith("+") ? tel : "+9" + ("0" + tel).slice(-11),
          email: email || "info@gespaenerji.com", identityNumber: tckn,
          registrationAddress: addr.address, ip: ip, city: addr.city, country: "Turkey"
        },
        shippingAddress: addr, billingAddress: addr,
        basketItems: lines.map((l, i) => ({
          id: l.p.id, name: l.p.name + (l.qty > 1 ? " x" + l.qty : ""),
          category1: "Solar Enerji", itemType: "PHYSICAL", price: iyzPrice(l.unit * l.qty)
        }))
      };
      iyzRequest("/payment/iyzipos/checkoutform/initialize/auth/ecom", payload, (err, out) => {
        if (err || !out || out.status !== "success" || !(out.paymentPageUrl || out.payWithIyzicoPageUrl)) {
          console.warn("iyzico başlatma hatası:", err ? err.message : (out && out.errorMessage));
          return sendJson(res, 502, { error: (out && out.errorMessage) || "Ödeme başlatılamadı; lütfen tekrar deneyin." });
        }
        writeOrder(out.token, {
          conversationId: convId, status: "pending", createdAt: new Date().toISOString(),
          totalTL: total, items: lines.map((l) => ({ id: l.p.id, qty: l.qty, unitTL: l.unit })),
          buyer: { ad: buyer.ad, tel: tel, eposta: email, il: il, adres: adres }
        });
        sendJson(res, 200, { url: out.paymentPageUrl || out.payWithIyzicoPageUrl });
      });
    });
    return true;
  }
  // GES Marketim / serbest tutar ödemesi (odeme.html) — tek kalemlik tahsilat.
  // Tutar istemciden gelir (link ödemesi doğası gereği); sınırlar sunucuda
  // uygulanır ve sipariş kaydına yazılır — kargo ÖNCESİ tutar mutlaka
  // orders.json/iyzico panelinden doğrulanmalıdır.
  if (urlPath === "/api/pay/custom" && req.method === "POST") {
    if (!(IYZ.apiKey && IYZ.secret)) return sendJson(res, 503, { error: "Kart ödemesi şu anda kapalı." }), true;
    readBody(req, 32 * 1024, (raw) => {
      let b; try { b = JSON.parse(raw); } catch (e) { return sendJson(res, 400, { error: "Geçersiz istek." }); }
      const amount = Math.round(+b.amountTL || 0);
      if (!(amount >= 50 && amount <= 250000)) return sendJson(res, 400, { error: "Tutar 50 ₺ ile 250.000 ₺ arasında olmalıdır." });
      const desc = String(b.desc || "").trim().slice(0, 120) || "GES Marketim siparişi";
      const ref = String(b.ref || "").trim().slice(0, 40);
      const buyer = b.buyer || {};
      const nm = String(buyer.ad || "").trim().split(/\s+/);
      const surname = nm.length > 1 ? nm.pop() : "-";
      const name = nm.join(" ") || "-";
      const tel = String(buyer.tel || "").replace(/[^\d+]/g, "");
      const email = String(buyer.eposta || "").trim();
      const tckn = String(buyer.tckn || "").replace(/\D/g, "");
      const adres = String(buyer.adres || "").trim();
      const il = String(buyer.il || "").trim();
      if (!name || !tel || !adres || !il) return sendJson(res, 400, { error: "Ad, telefon, il ve adres zorunludur." });
      if (!/^\d{11}$/.test(tckn)) return sendJson(res, 400, { error: "Kart ödemesi için 11 haneli T.C. kimlik numarası gereklidir." });
      const convId = "GMK" + Date.now().toString(36).toUpperCase();
      const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim() || "85.34.78.112";
      const addr = { contactName: (name + " " + surname).trim(), city: il.split("/")[0].trim() || "Antalya", country: "Turkey", address: adres + " " + il };
      const payload = {
        locale: "tr", conversationId: convId,
        price: iyzPrice(amount), paidPrice: iyzPrice(amount), currency: "TRY",
        basketId: convId, paymentGroup: "PRODUCT",
        callbackUrl: siteOrigin(req) + "/api/pay/callback",
        buyer: {
          id: "B" + Date.now(), name: name, surname: surname,
          gsmNumber: tel.startsWith("+") ? tel : "+9" + ("0" + tel).slice(-11),
          email: email || "info@gespaenerji.com", identityNumber: tckn,
          registrationAddress: addr.address, ip: ip, city: addr.city, country: "Turkey"
        },
        shippingAddress: addr, billingAddress: addr,
        basketItems: [{ id: "gesmarketim", name: desc, category1: "E-Mağaza", itemType: "PHYSICAL", price: iyzPrice(amount) }]
      };
      iyzRequest("/payment/iyzipos/checkoutform/initialize/auth/ecom", payload, (err, out) => {
        if (err || !out || out.status !== "success" || !(out.paymentPageUrl || out.payWithIyzicoPageUrl)) {
          console.warn("iyzico link ödeme hatası:", err ? err.message : (out && out.errorMessage));
          return sendJson(res, 502, { error: (out && out.errorMessage) || "Ödeme başlatılamadı; lütfen tekrar deneyin." });
        }
        writeOrder(out.token, {
          conversationId: convId, source: "gesmarketim", status: "pending",
          createdAt: new Date().toISOString(), totalTL: amount, desc: desc, ref: ref || undefined,
          buyer: { ad: buyer.ad, tel: tel, eposta: email, il: il, adres: adres }
        });
        sendJson(res, 200, { url: out.paymentPageUrl || out.payWithIyzicoPageUrl });
      });
    });
    return true;
  }
  if (urlPath === "/api/pay/callback" && req.method === "POST") {
    readBody(req, 16 * 1024, (raw) => {
      const m = /(?:^|&)token=([^&]+)/.exec(raw || "");
      const token = m ? decodeURIComponent(m[1].replace(/\+/g, " ")).trim() : "";
      const fail = () => { res.writeHead(302, { Location: "/odeme-sonuc.html?d=hata" }); res.end(); };
      if (!token || !(IYZ.apiKey && IYZ.secret)) return fail();
      iyzRequest("/payment/iyzipos/checkoutform/auth/ecom/detail", { locale: "tr", token: token }, (err, out) => {
        const ok = !err && out && out.status === "success" && out.paymentStatus === "SUCCESS";
        // Başarısız ödemenin sebebini SUNUCU LOG'una yaz (Railway → Logs).
        // orders.json Volume yoksa kalıcı değil; log olmadan sebep kaybolur.
        // Kart/kişisel veri YAZILMAZ — yalnız iyzico'nun durum ve hata alanları.
        if (!ok) {
          console.warn("iyzico ödeme başarısız:", JSON.stringify({
            conversationId: out && out.conversationId,
            paymentStatus: out && out.paymentStatus,
            mdStatus: out && out.mdStatus,          // 3D Secure sonucu (1 = doğrulama başarılı)
            errorCode: out && out.errorCode,
            errorGroup: out && out.errorGroup,
            errorMessage: (out && out.errorMessage) || (err && err.message)
          }));
        }
        writeOrder(token, {
          status: ok ? "paid" : "failed", resolvedAt: new Date().toISOString(),
          paymentId: out && out.paymentId, paidPrice: out && out.paidPrice,
          mdStatus: (!ok && out && out.mdStatus) || undefined,
          errorCode: (!ok && out && out.errorCode) || undefined,
          errorMessage: (!ok && out && out.errorMessage) || undefined
        });
        res.writeHead(302, { Location: ok ? "/odeme-sonuc.html?d=ok" : "/odeme-sonuc.html?d=hata" });
        res.end();
      });
    });
    return true;
  }
  return false;
}

const server = http.createServer((req, res) => {
  try {
    // HTTP → HTTPS (yalnızca proxy açıkça http dediğinde; aynı host korunur).
    // x-forwarded-proto yoksa (Railway iç sağlık kontrolü) yönlendirme YAPMA.
    // Not: www→apex yönlendirmesi yok — canlı alan adı www.gespaenerji.com.
    var host = (req.headers.host || "").toLowerCase();
    var xfp = req.headers["x-forwarded-proto"];
    if (xfp === "http" && host && !/^(localhost|127\.|0\.0\.0\.0)/.test(host)) {
      res.writeHead(301, { Location: "https://" + host + req.url });
      return res.end();
    }

    let urlPath;
    try { urlPath = decodeURIComponent(req.url.split("?")[0]); }
    catch (e) { res.writeHead(400); return res.end("Bad request"); }
    var qs = req.url.indexOf("?") >= 0 ? req.url.slice(req.url.indexOf("?")) : "";
    // Kısa/pazarlama URL'leri → gerçek sayfa (brief slug'ı + paket talimatındaki ad);
    // sorgu parametreleri (utm vb.) korunur
    if (/^(\/havuz-teknolojileri\/ai-cankurtaran-destek-sistemi\/?|\/cankurtaran(\.html)?)$/.test(urlPath)) {
      res.writeHead(301, { Location: "/ai-cankurtaran-destek-sistemi.html" + qs });
      return res.end();
    }
    // Ödeme API (iyzico) — anahtar tanımlı değilse status {enabled:false} döner
    if (urlPath.startsWith("/api/pay/")) {
      if (handlePayRoutes(req, res, urlPath)) return;
      res.writeHead(404); return res.end("Not found");
    }
    // Ziyaretçi API — footer sayacı (main.js) buradan okur; sayım HTML servisinde
    if (urlPath === "/api/visitors") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      return res.end(JSON.stringify({ total: visitTotal, online: onlineCount() }));
    }
    // Dizin kökü (/, /en/, /de/, /ru/) → index.html
    if (urlPath.endsWith("/")) urlPath += "index.html";

    let filePath = safeJoin(ROOT, urlPath);
    if (!filePath) {
      res.writeHead(400);
      return res.end("Bad request");
    }

    fs.stat(filePath, (err, stat) => {
      let status = 200;
      if (!err && stat.isDirectory()) {
        // /en gibi eğik çizgisiz dizin → /en/ (oradan index.html'e)
        res.writeHead(301, { Location: urlPath + "/" + qs });
        return res.end();
      }
      if (err || !stat.isFile()) {
        // Bulunamayan yol → 404 sayfası
        filePath = path.join(ROOT, "404.html");
        status = 404;
        try { stat = fs.statSync(filePath); } catch (e) { stat = null; }
      }
      const ext = path.extname(filePath).toLowerCase();
      const type = MIME[ext] || "application/octet-stream";
      const headers = {
        "Content-Type": type,
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "X-Frame-Options": "SAMEORIGIN"
      };
      // HTTPS üzerinden gelen isteklerde HSTS (proxy x-forwarded-proto bildirir)
      if (xfp === "https") headers["Strict-Transport-Security"] = "max-age=31536000";
      // Ziyaret sayımı: başarıyla servis edilen sayfa görüntülemeleri (admin hariç)
      if (ext === ".html" && status === 200 && req.method === "GET" && !/(^|\/)admin\.html$/.test(urlPath)) {
        countVisit(req, headers);
      }
      // İçerik Güvenliği Politikası (temkinli) — yalnızca HTML yanıtlarında
      if (ext === ".html") {
        headers["Content-Security-Policy"] = [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: https:",
          "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com",
          "frame-ancestors 'self'",
          "base-uri 'self'",
          "form-action 'self'"
        ].join("; ");
      }
      // Kod/içerik dosyaları (html/css/js/json/xml/txt/manifest) her zaman taze
      // (no-cache = önbelleğe alınır ama her seferinde doğrulanır → güncellemeler
      // anında görünür). Görsel/font/favicon uzun süre önbelleğe alınır.
      var fresh = /^\.(html|css|js|json|xml|txt|webmanifest)$/.test(ext);
      headers["Cache-Control"] = fresh
        ? "no-cache"
        : "public, max-age=2592000, stale-while-revalidate=86400";

      // Koşullu istekler: ETag (mtime-boyut) + Last-Modified → 304 (bant genişliği tasarrufu)
      if (stat) {
        const etag = 'W/"' + stat.mtime.getTime().toString(16) + "-" + stat.size.toString(16) + '"';
        headers["ETag"] = etag;
        headers["Last-Modified"] = stat.mtime.toUTCString();
        const inm = req.headers["if-none-match"];
        const ims = req.headers["if-modified-since"];
        if (status === 200 && (inm === etag || (!inm && ims && new Date(ims) >= new Date(stat.mtime.toUTCString())))) {
          res.writeHead(304, headers);
          return res.end();
        }
      }

      // Video: mp4 için Range istekleri desteklenir (sarma/ileri alma → 206)
      if (ext === ".mp4" && stat) {
        headers["Accept-Ranges"] = "bytes";
        const rng = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
        if (rng && status === 200 && (rng[1] !== "" || rng[2] !== "")) {
          let start = rng[1] === "" ? stat.size - parseInt(rng[2], 10) : parseInt(rng[1], 10);
          let end = rng[1] !== "" && rng[2] !== "" ? parseInt(rng[2], 10) : stat.size - 1;
          if (!(start >= 0 && start <= end && end < stat.size)) {
            headers["Content-Range"] = "bytes */" + stat.size;
            res.writeHead(416, headers);
            return res.end();
          }
          headers["Content-Range"] = "bytes " + start + "-" + end + "/" + stat.size;
          headers["Content-Length"] = end - start + 1;
          res.writeHead(206, headers);
          return fs.createReadStream(filePath, { start, end }).pipe(res);
        }
      }

      // Ön-sıkıştırılmış sürüm varsa onu gönder (build.js üretir: .br / .gz);
      // yoksa metin içeriğini anlık gzip'le
      const ae = (req.headers["accept-encoding"] || "");
      const tryPre = (enc, extra) => {
        const p = filePath + extra;
        let pre;
        try { pre = fs.statSync(p); } catch (e) { return false; }
        // Kaynak dosya sıkıştırılmış sürümden yeniyse bayat kopyayı SERVİS ETME
        // (ETag/Last-Modified kaynağa göre üretiliyor; eski gövde taze etiketle önbelleğe girerdi)
        if (stat && pre.mtimeMs < stat.mtimeMs) return false;
        headers["Content-Encoding"] = enc;
        headers["Vary"] = "Accept-Encoding";
        res.writeHead(status, headers);
        fs.createReadStream(p).pipe(res);
        return true;
      };
      if (COMPRESSIBLE.test(type)) {
        if (/\bbr\b/.test(ae) && tryPre("br", ".br")) return;
        if (/\bgzip\b/.test(ae) && tryPre("gzip", ".gz")) return;
      }
      const stream = fs.createReadStream(filePath);
      stream.on("error", function () { try { res.writeHead(500); res.end("Server error"); } catch (e) {} });
      if (/\bgzip\b/.test(ae) && COMPRESSIBLE.test(type)) {
        headers["Content-Encoding"] = "gzip";
        headers["Vary"] = "Accept-Encoding";
        res.writeHead(status, headers);
        stream.pipe(zlib.createGzip()).pipe(res);
      } else {
        res.writeHead(status, headers);
        stream.pipe(res);
      }
    });
  } catch (e) {
    res.writeHead(500);
    res.end("Server error");
  }
});

// Çok dilli statik sayfaları (/en, /de, /ru) başlangıçta üret
try {
  const built = require("./build").run();
  console.log(`GESPA build: ${built} dil sayfası hazır.`);
} catch (e) {
  console.warn("GESPA build atlandı:", e && e.message);
}

server.listen(PORT, () => {
  console.log(`GESPA Enerji sitesi http://localhost:${PORT} adresinde yayında`);
});
