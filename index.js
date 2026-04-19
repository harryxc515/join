const { startBot } = require("./src/bot");
const { startServer } = require("./src/server");

// Start HTTP server (required for Render port binding)
startServer();

// Start Telegram bot + DB connection
startBot().catch((err) => {
  console.error("Fatal error during startup:", err);
  process.exit(1);
});
