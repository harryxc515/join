const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    chatId: { type: String, required: true, unique: true },
    title: { type: String, default: "Unknown" },
    joinDeleted: { type: Number, default: 0 },
    leaveDeleted: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);

/**
 * Log a group event and increment the relevant counter.
 * @param {string|number} chatId
 * @param {string} title
 * @param {"join_deleted"|"leave_deleted"|"bot_added"} event
 */
async function logGroup(chatId, title, event) {
  if (mongoose.connection.readyState !== 1) return; // DB not connected, skip

  const inc = {};
  if (event === "join_deleted") inc.joinDeleted = 1;
  if (event === "leave_deleted") inc.leaveDeleted = 1;

  await Group.findOneAndUpdate(
    { chatId: String(chatId) },
    {
      $set: { title, lastActivity: new Date() },
      $inc: inc,
    },
    { upsert: true, new: true }
  );
}

/**
 * Get stats for a single group.
 */
async function getGroup(chatId) {
  if (mongoose.connection.readyState !== 1) return null;
  return Group.findOne({ chatId: String(chatId) });
}

/**
 * Get all groups (developer stats).
 */
async function getAllGroups() {
  if (mongoose.connection.readyState !== 1) return [];
  return Group.find().sort({ lastActivity: -1 });
}

module.exports = { logGroup, getGroup, getAllGroups };
