const http = require("http");

const PORT = process.env.PORT || 3000;

function startServer() {
  const server = http.createServer((req, res) => {
    if (req.url === "/health" || req.url === "/") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          bot: "Join Hider Bot",
          uptime: Math.floor(process.uptime()) + "s",
          timestamp: new Date().toISOString(),
        })
      );
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  });

  server.listen(PORT, () => {
    console.log(`✅ HTTP server listening on port ${PORT}`);
  });

  return server;
}

module.exports = { startServer };
