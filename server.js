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
