// backend/routes/chatRoutes.js
const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getChatHistory,
  markAsRead,
  sendAIMessage,
} = require("../controllers/chatController");

const { protect } = require("../middleware/authMiddleware");
const { uploadChatImage } = require("../middleware/upload");

// --------------------------------------------------
// ✅ SEND MESSAGE (TEXT or IMAGE)
// Roles allowed: customer, delivery, restaurant
// --------------------------------------------------
router.post(
  "/send",
  protect,
  uploadChatImage,
  sendMessage
);

// --------------------------------------------------
// ✅ GET CHAT HISTORY FOR AN ORDER
// --------------------------------------------------
router.get(
  "/history/:orderId",
  protect,
  getChatHistory
);

// --------------------------------------------------
// ✅ MARK ALL MESSAGES OF AN ORDER AS READ
// --------------------------------------------------
router.put(
  "/read/:orderId",
  protect,
  markAsRead
);

// --------------------------------------------------
// ✅ SEND AI MESSAGE (User → AI)
// AI will reply via separate AI controller
// --------------------------------------------------
router.post(
  "/ai",
  protect,
  sendAIMessage
);

module.exports = router;
