const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "build");
const port = Number(process.env.PORT || 3001);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml"
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store"
  });
  res.end(body);
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    const safePath = path
      .normalize(decodeURIComponent(url.pathname))
      .replace(/^(\.\.[/\\])+/, "");
    let filePath = path.join(root, safePath);

    if (!filePath.startsWith(root)) {
      return send(res, 403, "Forbidden");
    }

    if (url.pathname === "/" || !path.extname(filePath)) {
      filePath = path.join(root, "index.html");
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        return send(res, 404, "Not found");
      }

      send(res, 200, content, types[path.extname(filePath)] || "application/octet-stream");
    });
  })
  .listen(port, () => {
    console.log(`Variedades Store disponible en http://localhost:${port}`);
  });
