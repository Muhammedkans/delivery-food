// backend/models/ChatMessage.js
const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    messageType: {
      type: String,
      enum: ["text", "image", "system", "ai"],
      default: "text",
    },

    imageUrl: {
      type: String,
      default: "",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    socketRoomId: {
      // Group chat room per order
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);

