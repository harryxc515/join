require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { connectDB } = require("./db");
const { logGroup, getGroup, getAllGroups } = require("./groupModel");

process.noDeprecation = true;

const token = process.env.BOT_TOKEN;
const developerChatId = process.env.DEVELOPER_CHAT_ID;

if (!token || !developerChatId) {
  console.error("Error: BOT_TOKEN or DEVELOPER_CHAT_ID is not set in .env");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// ─── Delete join messages ───────────────────────────────────────────────────
bot.on("new_chat_members", async (msg) => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;
  const newMembers = msg.new_chat_members;

  try {
    await bot.deleteMessage(chatId, messageId);
    await logGroup(chatId, msg.chat.title || "Unknown", "join_deleted");
  } catch (error) {
    const botInfo = await bot.getMe();
    for (const member of newMembers) {
      if (member.id === botInfo.id) {
        bot.sendMessage(
          chatId,
          `Thank you for adding @${botInfo.username}. Please make me an administrator with the permission to delete messages.\n\nUse /status@${botInfo.username} to confirm the bot is running.\n\n(This message can be deleted)`
        );
        await logGroup(chatId, msg.chat.title || "Unknown", "bot_added");
      } else {
        const chatMember = await bot.getChatMember(chatId, botInfo.id);
        if (chatMember.status !== "administrator") {
          bot.sendMessage(
            chatId,
            "Please make me an admin so I can remove join and leave messages!"
          );
        }
      }
    }
  }
});

// ─── Delete leave messages ──────────────────────────────────────────────────
bot.on("left_chat_member", async (msg) => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;
  const botInfo = await bot.getMe();

  if (msg.left_chat_member.id !== botInfo.id) {
    try {
      await bot.deleteMessage(chatId, messageId);
      await logGroup(chatId, msg.chat.title || "Unknown", "leave_deleted");
    } catch (error) {
      const chatMember = await bot.getChatMember(chatId, botInfo.id);
      if (chatMember.status !== "administrator") {
        bot.sendMessage(
          chatId,
          "Please make me an admin so I can remove join and leave messages!"
        );
      }
    }
  }
});

// ─── Commands ───────────────────────────────────────────────────────────────
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (!text) return;

  if (text.startsWith("/start")) {
    try {
      const botInfo = await bot.getMe();
      const chat = await bot.getChat(chatId);

      if (chat.type === "private") {
        bot.sendMessage(
          chatId,
          `👋 Hello! I hide join/leave messages in your groups.\n\nAdd me as an administrator and I'll silently remove those notifications!`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "➕ Add me to your group!",
                    url: `https://t.me/${botInfo.username}?startgroup=true`,
                  },
                ],
              ],
            },
          }
        );
      } else {
        const chatMember = await bot.getChatMember(chatId, botInfo.id);
        if (chatMember.status !== "administrator") {
          bot.sendMessage(
            chatId,
            `To use this bot, make @${botInfo.username} an administrator.`
          );
        }
      }
    } catch (err) {
      console.error("Failed to handle /start:", err.message);
    }

  } else if (text.startsWith("/status")) {
    try {
      const botInfo = await bot.getMe();
      const chatMember = await bot.getChatMember(chatId, botInfo.id);
      const isAdmin = chatMember.status === "administrator";

      const groupData = await getGroup(chatId);
      const stats = groupData
        ? `\n\n📊 Stats for this group:\n• Join messages deleted: ${groupData.joinDeleted}\n• Leave messages deleted: ${groupData.leaveDeleted}`
        : "";

      bot.sendMessage(
        chatId,
        isAdmin
          ? `✅ @${botInfo.username} is running and removing join/leave messages.${stats}`
          : `❌ @${botInfo.username} is not an administrator. Please promote me to enable full functionality.`
      );
    } catch (err) {
      console.error("Failed to handle /status:", err.message);
    }

  } else if (text.startsWith("/stats") && String(chatId) === String(developerChatId)) {
    // Developer-only: show all groups
    try {
      const groups = await getAllGroups();
      if (!groups.length) {
        bot.sendMessage(chatId, "No groups logged yet.");
        return;
      }
      const lines = groups.map(
        (g) =>
          `📌 ${g.title} (${g.chatId})\n  Joins: ${g.joinDeleted} | Leaves: ${g.leaveDeleted}`
      );
      bot.sendMessage(chatId, `📋 All Groups:\n\n${lines.join("\n\n")}`);
    } catch (err) {
      console.error("Failed to handle /stats:", err.message);
    }
  }
});

// ─── Startup ─────────────────────────────────────────────────────────────────
async function startBot() {
  await connectDB();

  try {
    await bot.sendMessage(developerChatId, "🤖 Bot is online and running!");
  } catch (err) {
    console.error("Could not message developer:", err.message);
  }

  console.log("✅ Bot is running...");
}

module.exports = { bot, startBot };
