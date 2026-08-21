/**
 * GESPA Enerji — sipariş kaydı
 *
 * Statik sitede sipariş yalnızca WhatsApp'a gidiyordu; gönderim tamamlanmazsa
 * talep izsiz kayboluyordu. Artık HER sipariş (havale, kapıda ve kartlı) önce
 * buraya yazılır, sonra ödeme/WhatsApp adımına geçilir.
 *
 * Depolama: DATA_DIR/orders/<KOD>.json + orders/index.jsonl (özet günlük).
 * DATA_DIR Railway'de Volume'a bağlanmalıdır; yoksa dağıtımda kayıtlar silinir
 * (ziyaretçi sayacıyla aynı kural — README ve CLAUDE.md'de yazılı).
 *
 * KVKK: burada yalnızca siparişin ifası için gereken iletişim/teslimat bilgisi
 * tutulur. KART BİLGİSİ HİÇBİR ZAMAN BURAYA GELMEZ — kart verisi yalnız
 * iyzico'nun kendi ödeme sayfasında işlenir.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "data");
const ORDER_DIR = path.join(DATA_DIR, "orders");
const INDEX_FILE = path.join(ORDER_DIR, "index.jsonl");

const CODE_RE = /^GES-[0-9A-Z]{6}-[0-9A-F]{8}$/;

function ensureDir() {
  fs.mkdirSync(ORDER_DIR, { recursive: true });
}

/**
 * Sipariş kodu: GES-<yılay gün36>-<8 hex>. Tarih kısmı insan için, hex kısmı
 * tahmin edilemezlik içindir — sipariş durumu bu kodla sorgulanır.
 */
function newCode(now) {
  const d = now || new Date();
  const stamp = (
    d.getUTCFullYear().toString(36) +
    (d.getUTCMonth() + 1).toString(36) +
    d.getUTCDate().toString(36) +
    d.getUTCHours().toString(36)
  ).toUpperCase().padEnd(6, "0").slice(0, 6);
  return "GES-" + stamp + "-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

function isCode(code) {
  return typeof code === "string" && CODE_RE.test(code);
}

function fileOf(code) {
  if (!isCode(code)) return null;            // yol enjeksiyonuna kapalı
  return path.join(ORDER_DIR, code + ".json");
}

/** Atomik yazım: geçici dosyaya yaz, sonra yerine taşı (yarım dosya kalmasın) */
function writeOrder(order) {
  ensureDir();
  const f = fileOf(order.code);
  if (!f) throw new Error("Geçersiz sipariş kodu");
  const tmp = f + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(order, null, 2));
  fs.renameSync(tmp, f);
  return order;
}

function read(code) {
  const f = fileOf(code);
  if (!f) return null;
  try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { return null; }
}

/** Özet günlük — tek satırlık kayıt; siparişleri hızlı gözden geçirmek için */
function appendIndex(order) {
  try {
    ensureDir();
    fs.appendFileSync(INDEX_FILE, JSON.stringify({
      code: order.code, at: order.createdAt, method: order.method,
      status: order.status, total: order.totals.payable, name: order.customer.name
    }) + "\n");
  } catch (e) { /* günlük yazılamazsa sipariş yine de kayıtlı */ }
}

/**
 * Yeni sipariş oluşturur. `totals` ve `items` SUNUCUDA hesaplanmış olmalıdır —
 * istemciden gelen tutar asla buraya geçirilmez.
 */
function create(data) {
  const now = new Date();
  const order = {
    code: newCode(now),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    status: data.status || "bekliyor",     // bekliyor · odendi · basarisiz · iptal
    method: data.method,                   // havale · kapida · kart
    locale: data.locale || "tr",
    items: data.items,
    totals: data.totals,
    customer: data.customer,
    payment: data.payment || null,
    meta: data.meta || {}
  };
  writeOrder(order);
  appendIndex(order);
  return order;
}

/** Var olan siparişi günceller (ödeme sonucu, durum değişikliği). */
function update(code, patch) {
  const order = read(code);
  if (!order) return null;
  Object.keys(patch).forEach((k) => { order[k] = patch[k]; });
  order.updatedAt = new Date().toISOString();
  writeOrder(order);
  return order;
}

/**
 * Sonuç sayfasının okuyabileceği KISITLI görünüm — adres, telefon ve e-posta
 * dışarı verilmez (kod ele geçse bile kişisel veri sızmasın).
 */
function publicView(order) {
  if (!order) return null;
  return {
    code: order.code,
    status: order.status,
    method: order.method,
    total: order.totals.payable,
    currency: "TRY",
    createdAt: order.createdAt,
    itemCount: order.items.reduce((n, i) => n + i.qty, 0),
    firstName: (order.customer.name || "").split(" ")[0] || "",
    error: (order.payment && order.payment.errorMessage) || null
  };
}

module.exports = { create, read, update, isCode, publicView, newCode, ORDER_DIR };
