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
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function safeJoin(base, target) {
  const targetPath = path.normalize(path.join(base, target));
  if (!targetPath.startsWith(base)) return null; // path traversal koruması
  return targetPath;
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

    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    // Dizin kökü (/, /en/, /de/, /ru/) → index.html
    if (urlPath.endsWith("/")) urlPath += "index.html";

    let filePath = safeJoin(ROOT, urlPath);
    if (!filePath) {
      res.writeHead(400);
      return res.end("Bad request");
    }

    fs.stat(filePath, (err, stat) => {
      let status = 200;
      if (err || !stat.isFile()) {
        // Bulunamayan yol → 404 sayfası
        filePath = path.join(ROOT, "404.html");
        status = 404;
      }
      const ext = path.extname(filePath).toLowerCase();
      const type = MIME[ext] || "application/octet-stream";
      const headers = {
        "Content-Type": type,
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "X-Frame-Options": "SAMEORIGIN"
      };
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
      headers["Cache-Control"] = fresh ? "no-cache" : "public, max-age=604800";

      // Accept-Encoding destekliyorsa metin içeriği gzip ile gönder
      const ae = (req.headers["accept-encoding"] || "");
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
