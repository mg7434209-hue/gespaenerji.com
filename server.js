/**
 * GESPA Enerji — basit statik dosya sunucusu (Railway için)
 * Bağımlılık gerektirmez: Node.js'in yerleşik http/fs modülleriyle çalışır.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

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
      if (err || !stat.isFile()) {
        // Bilinmeyen yol → ana sayfaya düş (SPA benzeri davranış)
        filePath = path.join(ROOT, "index.html");
      }
      const ext = path.extname(filePath).toLowerCase();
      const type = MIME[ext] || "application/octet-stream";
      const headers = { "Content-Type": type };
      // Statik varlıkları önbelleğe al, HTML'i alma
      if (ext !== ".html") headers["Cache-Control"] = "public, max-age=86400";
      res.writeHead(200, headers);
      fs.createReadStream(filePath).pipe(res);
    });
  } catch (e) {
    res.writeHead(500);
    res.end("Server error");
  }
});

server.listen(PORT, () => {
  console.log(`GESPA Enerji sitesi http://localhost:${PORT} adresinde yayında`);
});
