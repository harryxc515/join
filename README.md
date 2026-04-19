# 🤖 Telegram Join Hider Bot

A Node.js Telegram bot that silently deletes join and leave messages in group chats. Includes MongoDB for stats tracking and is ready for **Render.com** deployment.

---

## 📁 Project Structure

```
tg-join-hider-bot/
├── index.js              # Entry point — starts HTTP server + bot
├── render.yaml           # Render deployment config
├── package.json
├── .env.example
└── src/
    ├── bot.js            # Telegram bot logic + commands
    ├── server.js         # HTTP server (Render port binding + /health)
    ├── db.js             # MongoDB connection (mongoose)
    └── groupModel.js     # Group schema + stats helpers
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable           | Description                                       |
|--------------------|---------------------------------------------------|
| `BOT_TOKEN`        | Your bot token from [@BotFather](https://t.me/BotFather) |
| `DEVELOPER_CHAT_ID`| Your Telegram user ID (receives startup message)  |
| `MONGO_URI`        | MongoDB Atlas connection string                   |
| `PORT`             | Auto-set by Render — do **not** set manually      |

---

## 🚀 Deploy to Render

1. Push this repo to GitHub.
2. Go to [render.com](https://render.com) → **New Web Service** → connect your repo.
3. Render will auto-detect `render.yaml`.
4. Add your environment variables in the Render dashboard.
5. Done — the bot starts automatically!

> Render's free tier spins down after inactivity. The `/health` HTTP endpoint keeps the service alive when pinged by an uptime monitor (e.g., [UptimeRobot](https://uptimerobot.com)).

---

## 🗄️ MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user and whitelist `0.0.0.0/0` for Render's IPs.
3. Copy the connection string and set it as `MONGO_URI`.

---

## 💬 Bot Commands

| Command    | Description                              |
|------------|------------------------------------------|
| `/start`   | Welcome message with add-to-group button |
| `/status`  | Check if bot is admin + group stats      |
| `/stats`   | (Developer only) Show all group stats    |

---

## 🛠 Local Development

```bash
npm install
cp .env.example .env
# Fill in .env values
npm run dev   # uses nodemon for auto-reload
```

---

## 📦 Dependencies

| Package                | Purpose                         |
|------------------------|---------------------------------|
| `node-telegram-bot-api`| Telegram Bot API client         |
| `mongoose`             | MongoDB ODM                     |
| `dotenv`               | Load `.env` variables           |
| `nodemon` (dev)        | Auto-reload on file changes     |
