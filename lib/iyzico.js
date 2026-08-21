/**
 * GESPA Enerji — iyzico Ödeme Formu (Checkout Form) istemcisi
 *
 * Bağımlılık YOKTUR: Node'un yerleşik https/crypto modülleriyle çalışır
 * (projenin geri kalanı gibi). Kimlik doğrulama iyzico'nun IYZWSv2 şemasıdır:
 *
 *   imza  = HMAC-SHA256(randomKey + uriPath + JSON.stringify(body), secretKey)
 *   başlık= "IYZWSv2 " + base64("apiKey:...&randomKey:...&signature:...")
 *
 * İmzalanan gövde ile GÖNDERİLEN gövde birebir aynı olmalıdır; bu yüzden JSON
 * bir kez üretilir ve hem imzada hem istekte o dize kullanılır.
 *
 * ANAHTARLAR KODA YAZILMAZ — yalnızca ortam değişkeninden okunur:
 *   IYZICO_API_KEY · IYZICO_SECRET_KEY · IYZICO_URI
 * IYZICO_URI verilmezse kum havuzu (sandbox) kullanılır; canlıya geçerken
 * https://api.iyzipay.com yapılır. Anahtar yoksa modül "kapalı" bildirir ve
 * sepet kartla ödemeyi göstermez.
 */
"use strict";

const https = require("https");
const crypto = require("crypto");
const { URL } = require("url");

const SANDBOX_URI = "https://sandbox-api.iyzipay.com";
const CLIENT_VERSION = "gespa-node-1.0";
const TIMEOUT_MS = 20000;

const PATHS = {
  init: "/payment/iyzipos/checkoutform/initialize/auth/ecom",
  detail: "/payment/iyzipos/checkoutform/auth/ecom/detail"
};

function conf() {
  return {
    apiKey: process.env.IYZICO_API_KEY || "",
    secretKey: process.env.IYZICO_SECRET_KEY || "",
    uri: (process.env.IYZICO_URI || SANDBOX_URI).replace(/\/+$/, "")
  };
}

/** Kartla ödeme kullanılabilir mi (anahtarlar tanımlı mı)? */
function enabled() {
  const c = conf();
  return !!(c.apiKey && c.secretKey);
}

/** Canlı ortam mı, kum havuzu mu (arayüzde uyarı göstermek için) */
function isSandbox() {
  return !/(^|\/\/)api\.iyzipay\.com/.test(conf().uri);
}

/**
 * iyzico fiyat biçimi: her zaman ondalık ayraçlı dize ("25000.0", "1234.56").
 * Resmî istemcinin formatPrice davranışıyla birebir aynıdır.
 */
function formatPrice(price) {
  if ((typeof price !== "number" && typeof price !== "string") || !isFinite(price)) return price;
  const s = parseFloat(price).toString();
  return s.indexOf(".") === -1 ? s + ".0" : s;
}

function randomKey() {
  // Resmî istemci process.hrtime()[0] + rastgele kullanır; burada da benzersiz
  // ve tahmin edilemez olması yeterli.
  return process.hrtime()[0].toString() + crypto.randomBytes(8).toString("hex");
}

function authHeader(uriPath, bodyJson, rnd) {
  const c = conf();
  const signature = crypto
    .createHmac("sha256", c.secretKey)
    .update(rnd + uriPath + bodyJson)
    .digest("hex");
  const params = ["apiKey:" + c.apiKey, "randomKey:" + rnd, "signature:" + signature];
  return "IYZWSv2 " + Buffer.from(params.join("&")).toString("base64");
}

/** iyzico'ya imzalı POST — çözümlenmiş JSON gövdeyle döner. */
function post(uriPath, body) {
  return new Promise((resolve, reject) => {
    const c = conf();
    if (!c.apiKey || !c.secretKey) return reject(new Error("iyzico anahtarları tanımlı değil"));

    const json = JSON.stringify(body);       // imzalanan ve gönderilen TEK dize
    const rnd = randomKey();
    const target = new URL(c.uri + uriPath);

    const req = https.request(
      {
        hostname: target.hostname,
        port: target.port || 443,
        path: uriPath,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(json),
          Accept: "application/json",
          "x-iyzi-rnd": rnd,
          "x-iyzi-client-version": CLIENT_VERSION,
          Authorization: authHeader(uriPath, json, rnd)
        }
      },
      (res) => {
        let raw = "";
        res.setEncoding("utf8");
        res.on("data", (d) => {
          raw += d;
          if (raw.length > 2e6) { req.destroy(new Error("iyzico yanıtı beklenmedik biçimde büyük")); }
        });
        res.on("end", () => {
          try { resolve(JSON.parse(raw)); }
          catch (e) { reject(new Error("iyzico yanıtı okunamadı (HTTP " + res.statusCode + ")")); }
        });
      }
    );

    req.setTimeout(TIMEOUT_MS, () => req.destroy(new Error("iyzico zaman aşımı")));
    req.on("error", reject);
    req.end(json);
  });
}

/**
 * Ödeme formunu başlat.
 * Dönen `paymentPageUrl` iyzico'nun barındırdığı 3D Secure'lü ödeme sayfasıdır;
 * kart bilgisi hiçbir zaman bizim sunucumuza uğramaz.
 */
function initializeCheckoutForm(p) {
  const body = {
    locale: p.locale || "tr",
    conversationId: String(p.conversationId),
    price: formatPrice(p.price),
    paidPrice: formatPrice(p.paidPrice != null ? p.paidPrice : p.price),
    currency: p.currency || "TRY",
    basketId: String(p.basketId),
    paymentGroup: p.paymentGroup || "PRODUCT",
    callbackUrl: p.callbackUrl,
    enabledInstallments: p.enabledInstallments || [1],
    buyer: p.buyer,
    shippingAddress: p.shippingAddress,
    billingAddress: p.billingAddress,
    basketItems: (p.basketItems || []).map((b) => ({
      id: String(b.id),
      name: b.name,
      category1: b.category1 || "Solar",
      itemType: b.itemType || "PHYSICAL",
      price: formatPrice(b.price)
    }))
  };
  return post(PATHS.init, body);
}

/** Ödeme sonucunu token ile sorgula (callback'te ZORUNLU doğrulama adımı). */
function retrieveCheckoutForm(token, conversationId) {
  return post(PATHS.detail, {
    locale: "tr",
    conversationId: String(conversationId || ""),
    token: String(token)
  });
}

module.exports = {
  enabled,
  isSandbox,
  formatPrice,
  initializeCheckoutForm,
  retrieveCheckoutForm,
  // testler için
  _authHeader: authHeader
};
