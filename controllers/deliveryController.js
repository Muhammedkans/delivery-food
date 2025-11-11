// backend/controllers/deliveryController.js
const Order = require("../models/Order");
const DeliveryPartner = require("../models/DeliveryPartner");
const User = require("../models/User");

// --------------------------------------------------
// ✅ GO ONLINE / GO OFFLINE
// --------------------------------------------------
exports.toggleOnlineStatus = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findOne({ user: req.user._id });
    if (!partner) {
      return res.status(404).json({ success: false, message: "Delivery partner not found" });
    }

    partner.isOnline = !partner.isOnline;
    await partner.save();

    res.status(200).json({
      success: true,
      message: `Status updated: ${partner.isOnline ? "Online" : "Offline"}`,
      isOnline: partner.isOnline,
    });
  } catch (error) {
    console.error("Toggle Online Status Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ UPDATE LIVE LOCATION
// --------------------------------------------------
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    const partner = await DeliveryPartner.findOne({ user: req.user._id });
    if (!partner) {
      return res.status(404).json({ success: false, message: "Delivery partner not found" });
    }

    partner.location = { type: "Point", coordinates: [lng, lat] };
    await partner.save();

    res.status(200).json({
      success: true,
      message: "Location updated",
    });
  } catch (error) {
    console.error("Update Location Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ ACCEPT ORDER
// --------------------------------------------------
exports.acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.status !== "assigned") {
      return res.status(400).json({
        success: false,
        message: "Order already accepted or completed",
      });
    }

    order.status = "accepted";
    order.deliveryPartner = req.user._id;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order accepted",
      order,
    });
  } catch (error) {
    console.error("Accept Order Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ REJECT ORDER
// --------------------------------------------------
exports.rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.deliveryPartner?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    order.status = "assigned";
    order.deliveryPartner = null;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order rejected",
    });
  } catch (error) {
    console.error("Reject Order Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ PICKED UP ORDER
// --------------------------------------------------
exports.markPickedUp = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.deliveryPartner?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    order.status = "picked_up";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order picked up",
    });
  } catch (error) {
    console.error("Pick Up Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ MARK DELIVERED
// --------------------------------------------------
exports.markDelivered = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.deliveryPartner?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    order.status = "delivered";
    order.deliveredAt = Date.now();
    await order.save();

    // ✅ Add earning
    await DeliveryPartner.findOneAndUpdate(
      { user: req.user._id },
      { $inc: { earnings: 40 } } // base amount (editable)
    );

    res.status(200).json({
      success: true,
      message: "Order delivered",
    });
  } catch (error) {
    console.error("Deliver Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ DELIVERY DASHBOARD STATS
// --------------------------------------------------
exports.deliveryDashboard = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findOne({ user: req.user._id });
    if (!partner) {
      return res.status(404).json({ success: false, message: "Delivery partner not found" });
    }

    const completedOrders = await Order.countDocuments({
      deliveryPartner: req.user._id,
      status: "delivered",
    });

    const activeOrders = await Order.find({
      deliveryPartner: req.user._id,
      status: { $in: ["accepted", "picked_up"] },
    });

    res.status(200).json({
      success: true,
      data: {
        completedOrders,
        activeOrders,
        earnings: partner.earnings,
        isOnline: partner.isOnline,
      },
    });
  } catch (error) {
    console.error("Delivery Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

