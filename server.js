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
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath === "/") urlPath = "/index.html";

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
      // HTML her zaman taze; diğer statik varlıkları 7 gün önbelleğe al
      headers["Cache-Control"] = ext === ".html" ? "no-cache" : "public, max-age=604800";

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

server.listen(PORT, () => {
  console.log(`GESPA Enerji sitesi http://localhost:${PORT} adresinde yayında`);
});
