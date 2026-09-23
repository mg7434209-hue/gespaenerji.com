#!/usr/bin/env node
/**
 * IndexNow bildirimi — Bing / Yandex / Naver / Seznam / Yep indekslerine
 * (api.indexnow.org hepsine dağıtır) değişen sayfaları anında bildirir.
 * Bing indeksi Copilot ve ChatGPT aramasını beslediği için doğrudan AI
 * görünürlüğü demektir; Google IndexNow kullanmaz (sitemap + Search Console).
 *
 *   node tools/indexnow.js            # son commit'te değişen HTML sayfaları
 *   node tools/indexnow.js --base=SHA # SHA..HEAD aralığında değişenler (tüm push)
 *   node tools/indexnow.js --all      # sitemap'in tamamı (ilk kurulum / büyük değişiklik)
 *   node tools/indexnow.js --dry-run  # gönderilecek payload'ı bas, ağ kullanma
 *   node tools/indexnow.js --wait-live  # canlı site bu commit'i yayına alana dek bekle
 *                                      # (en çok --wait-min=N dk, varsayılan 10)
 *
 * Anahtar: kök dizindeki <32 hex>.txt dosyası (IndexNow bu dosyayı sitede
 * doğrular; anahtar tasarım gereği HERKESE AÇIKTIR, sır değildir). Kendi iş
 * akışında (.github/workflows/indexnow.yml) --wait-live ile çalışır; Pages
 * yayınını etkilemez. Elle tam gönderim: Actions → IndexNow → Run workflow (all).
 */
"use strict";
const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const ORIGIN = "https://www.gespaenerji.com";
const HOST = "www.gespaenerji.com";
const LANGS = ["en", "de", "ru"];
const args = process.argv.slice(2);
const ALL = args.includes("--all");
const DRY = args.includes("--dry-run");
const WAIT = args.includes("--wait-live");
const WAIT_MIN = +((args.find(x => x.startsWith("--wait-min=")) || "").slice(11)) || 10;

function keyFile() {
  const f = fs.readdirSync(ROOT).find(x => /^[a-f0-9]{32}\.txt$/.test(x));
  if (!f) throw new Error("IndexNow anahtar dosyası (<32 hex>.txt) kök dizinde yok.");
  return { key: f.replace(/\.txt$/, ""), file: f };
}
function sitemapUrls() {
  const xml = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
}
function urlsOf(file) {
  const rel = file === "index.html" ? "" : file;
  return [ORIGIN + "/" + rel].concat(LANGS.map(l => ORIGIN + "/" + l + "/" + rel));
}
// --base=<sha>: push'tan önceki commit (Actions: github.event.before). Tek push'ta
// birden çok commit gelince yalnız HEAD~1'e bakmak öncekilerin sayfalarını
// kaçırıyordu. Base çözülemezse (yeni dal, zorla push, elle çalıştırma) HEAD~1.
function baseRef() {
  const a = args.find(x => x.startsWith("--base="));
  const sha = a ? a.slice(7).trim() : "";
  if (/^[0-9a-f]{7,40}$/.test(sha) && !/^0+$/.test(sha)) {
    try { execSync("git cat-file -e " + sha + "^{commit}", { cwd: ROOT, stdio: "ignore" }); return sha; } catch (e) {}
  }
  return "HEAD~1";
}
function changedUrls() {
  let files = [];
  try {
    files = execSync("git diff --name-only " + baseRef() + " HEAD", { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] })
      .toString().split("\n").map(x => x.trim()).filter(Boolean);
  } catch (e) { return null; }   // sığ klon (HEAD~1 yok) → tamamı
  const all = new Set(sitemapUrls());
  const out = new Set();
  for (const f of files) {
    // kök TR sayfası ya da dil kopyası → o sayfanın 4 dil URL'si (sitemap'te olanlar)
    const m = /^(?:(en|de|ru)\/)?([a-z0-9-]+\.html)$/.exec(f);
    if (m) urlsOf(m[2]).forEach(u => { if (all.has(u)) out.add(u); });
    // ürün/config/i18n değişti → katalog ve vitrin sayfaları
    if (/^assets\/(config|i18n)\.js$/.test(f)) ["online-satis.html", "urunler.html", "index.html"].forEach(p => urlsOf(p).forEach(u => { if (all.has(u)) out.add(u); }));
  }
  return [...out];
}
function submit(urls, key) {
  const body = JSON.stringify({ host: HOST, key: key, keyLocation: ORIGIN + "/" + key + ".txt", urlList: urls });
  return new Promise(resolve => {
    const req = https.request({ hostname: "api.indexnow.org", path: "/indexnow", method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(body) }, timeout: 15000 },
      res => { let d = ""; res.on("data", c => d += c); res.on("end", () => resolve({ status: res.statusCode, body: d })); });
    req.on("timeout", () => { req.destroy(new Error("zaman aşımı")); });
    req.on("error", e => resolve({ status: 0, body: e.message }));
    req.end(body);
  });
}
function get(url) {
  return new Promise(resolve => {
    const req = https.get(url, { timeout: 20000, headers: { "User-Agent": "gespa-indexnow-check", "Cache-Control": "no-cache" } }, res => {
      let d = ""; res.setEncoding("utf8");
      res.on("data", c => d += c);
      res.on("end", () => resolve({ status: res.statusCode, body: d, location: res.headers.location }));
    });
    req.on("timeout", () => { req.destroy(new Error("zaman aşımı")); });
    req.on("error", e => resolve({ status: 0, body: e.message }));
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
function localFileOf(url) {
  let p = url.slice(ORIGIN.length + 1);
  if (p === "" || p.endsWith("/")) p += "index.html";
  return path.join(ROOT, p);
}
// Canlı site (Railway) Pages'ten AYRI dağıtılır. Bildirim canlıdan önce giderse
// Bing eski sayfayı tarar; anahtar dosyası canlıda yokken giderse IndexNow
// doğrulamayı başarısız sayar ve sonraki bildirimler de 403 döner (ilk kurulumda
// böyle oldu). Bu yüzden: anahtar dosyası canlıda VE değişen ilk sayfanın canlı
// içeriği repodakiyle BİREBİR aynı olana dek beklenir (build her ortamda aynı
// çıktıyı üretir, sunucu dosyayı değiştirmeden servis eder).
async function waitLive(urls, key) {
  const keyUrl = ORIGIN + "/" + key + ".txt";
  const probe = urls.find(u => !/\/(en|de|ru)\//.test(u.slice(ORIGIN.length))) || urls[0];
  const lf = localFileOf(probe);
  const local = fs.existsSync(lf) ? fs.readFileSync(lf, "utf8") : null;
  const deadline = Date.now() + WAIT_MIN * 60000;
  let k, pg;
  for (;;) {
    [k, pg] = await Promise.all([get(keyUrl), get(probe)]);
    const keyOk = k.status === 200 && k.body.trim() === key;
    const pageOk = pg.status === 200 && (local === null || pg.body === local);
    if (keyOk && pageOk) { console.log("Canlı sürüm hazır (" + probe + ")."); return true; }
    if (Date.now() > deadline) break;
    await sleep(20000);
  }
  const keyOk = k.status === 200 && k.body.trim() === key;
  console.log("Anahtar dosyası: " + keyUrl + " → HTTP " + k.status
    + (k.status === 200 ? (keyOk ? " (doğru)" : " (içerik anahtarla eşleşmiyor)") : "") + (k.location ? " → " + k.location : ""));
  console.log("Yoklama sayfası: " + probe + " → HTTP " + pg.status
    + (pg.status === 200 ? (pg.body === local ? " (bu commit)" : " (canlı içerik bu commit'ten farklı)") : "") + (pg.location ? " → " + pg.location : ""));
  if (!keyOk) {
    console.warn("UYARI: anahtar dosyası canlıda yok — bildirim GÖNDERİLMEDİ. Canlı site (Railway) bu dalı mı yayınlıyor?");
    return false;
  }
  console.warn("UYARI: canlı sürüm " + WAIT_MIN + " dk içinde bu commit'le eşleşmedi; yine de gönderiliyor.");
  return true;
}
(async () => {
  const { key, file } = keyFile();
  let urls = ALL ? sitemapUrls() : changedUrls();
  if (urls === null) { console.log("IndexNow: git geçmişi yok, sitemap'in tamamı gönderiliyor."); urls = sitemapUrls(); }
  urls = urls.slice(0, 10000);
  if (!urls.length) { console.log("IndexNow: değişen sayfa yok, gönderim atlandı."); return; }
  console.log("IndexNow: " + urls.length + " URL (" + (ALL ? "tamamı" : "değişenler") + "), anahtar dosyası " + file);
  if (DRY) { console.log(JSON.stringify({ host: HOST, keyLocation: ORIGIN + "/" + file, urlList: urls }, null, 1)); return; }
  if (WAIT && !(await waitLive(urls, key))) return;
  const r = await submit(urls, key);
  // 200/202 = kabul edildi; 4xx = anahtar/istek sorunu; deploy DÜŞÜRÜLMEZ
  console.log("IndexNow yanıtı: HTTP " + r.status + (r.body ? " " + String(r.body).slice(0, 200) : ""));
  if (!(r.status === 200 || r.status === 202)) console.warn("UYARI: IndexNow kabul etmedi — anahtar dosyası yayında mı? " + ORIGIN + "/" + file);
})().catch(e => { console.warn("IndexNow hata: " + e.message); });
