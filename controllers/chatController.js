// backend/controllers/chatController.js
const ChatMessage = require("../models/ChatMessage");
const Order = require("../models/Order");
const cloudinary = require("../config/cloudinaryConfig");

// --------------------------------------------------
// ✅ SEND MESSAGE (Text or Image)
// --------------------------------------------------
exports.sendMessage = async (req, res) => {
  try {
    const { orderId, receiver, message } = req.body;

    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    let imageUrl = "";

    // ✅ If image file exists → upload to Cloudinary
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: `foodapp/chats/${orderId}`,
      });
      imageUrl = upload.secure_url;
    }

    const chatMessage = await ChatMessage.create({
      order: orderId,
      sender: req.user._id,
      receiver,
      message,
      messageType: req.file ? "image" : "text",
      imageUrl,
      socketRoomId: orderId.toString(),
    });

    // ✅ Emit real-time message
    req.io.to(orderId.toString()).emit("new_message", chatMessage);

    res.status(201).json({
      success: true,
      chatMessage,
    });
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ GET CHAT HISTORY FOR AN ORDER
// --------------------------------------------------
exports.getChatHistory = async (req, res) => {
  try {
    const { orderId } = req.params;

    const messages = await ChatMessage.find({ order: orderId })
      .populate("sender", "name role")
      .populate("receiver", "name role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Chat History Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ MARK ALL MESSAGES AS READ
// --------------------------------------------------
exports.markAsRead = async (req, res) => {
  try {
    const { orderId } = req.params;

    await ChatMessage.updateMany(
      {
        order: orderId,
        receiver: req.user._id,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Mark As Read Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ SEND AI GENERATED MESSAGE
// --------------------------------------------------
exports.sendAIMessage = async (req, res) => {
  try {
    const { orderId, message } = req.body;

    // Here we don't generate AI yet — we store for frontend AI usage.
    // AI controller will generate actual AI reply.
    const chatMessage = await ChatMessage.create({
      order: orderId,
      sender: req.user._id,
      receiver: req.user._id,
      message,
      messageType: "ai",
      socketRoomId: orderId.toString(),
    });

    req.io.to(orderId.toString()).emit("new_message", chatMessage);

    res.status(201).json({
      success: true,
      chatMessage,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ success: false, message: "Could not send AI message" });
  }
};
