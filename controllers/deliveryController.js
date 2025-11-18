// backend/controllers/deliveryController.js

const Order = require("../models/Order");
const DeliveryPartner = require("../models/DeliveryPartner");
const User = require("../models/User");
const { emitOrderUpdate } = require("../sockets/index");

// --------------------------------------------------
// 1️⃣ TOGGLE ONLINE / OFFLINE
// --------------------------------------------------
exports.toggleOnlineStatus = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findOne({ user: req.user._id });
    if (!partner)
      return res.status(404).json({ success: false, message: "Delivery partner not found" });

    partner.isOnline = !partner.isOnline;
    partner.lastActiveAt = new Date();
    await partner.save();

    return res.status(200).json({
      success: true,
      isOnline: partner.isOnline,
      message: `You are now ${partner.isOnline ? "Online" : "Offline"}`,
    });
  } catch (error) {
    console.error("Toggle Online Status Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// 2️⃣ UPDATE LIVE LOCATION
// --------------------------------------------------
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (lat === undefined || lng === undefined)
      return res.status(400).json({ success: false, message: "Latitude & longitude required" });

    const partner = await DeliveryPartner.findOne({ user: req.user._id });
    if (!partner)
      return res.status(404).json({ success: false, message: "Delivery partner not found" });

    partner.location = { type: "Point", coordinates: [lng, lat] };
    partner.lastActiveAt = new Date();
    await partner.save();

    // Notify active orders
    const activeOrders = await Order.find({
      deliveryPartner: req.user._id,
      orderStatus: { $in: ["On the Way", "Ready for Pickup"] },
    });

    activeOrders.forEach((order) => {
      req.io.to(order.socketRoomId).emit("deliveryLocation", {
        orderId: order._id,
        location: partner.location,
        deliveryPartnerId: req.user._id,
        timestamp: new Date(),
      });
    });

    return res.status(200).json({ success: true, message: "Location updated" });
  } catch (error) {
    console.error("Update Location Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// 3️⃣ UPDATE DELIVERY STATUS
// --------------------------------------------------
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatus = ["Accepted", "Picked Up", "Delivered", "Rejected"];

    if (!validStatus.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.deliveryPartner && order.deliveryPartner.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });

    // Update status flow
    if (status === "Accepted") {
      order.orderStatus = "On the Way";
      order.deliveryPartner = req.user._id;
    }
    if (status === "Rejected") {
      order.orderStatus = "Ready for Pickup";
      order.deliveryPartner = null;
    }
    if (status === "Picked Up") {
      order.orderStatus = "On the Way";
    }
    if (status === "Delivered") {
      order.orderStatus = "Delivered";
      order.deliveredAt = new Date();
      await DeliveryPartner.findOneAndUpdate(
        { user: req.user._id },
        { $inc: { earnings: 40 } }
      );
    }

    order.timeline.push({ status, timestamp: new Date() });
    await order.save();

    emitOrderUpdate(order.socketRoomId, {
      status,
      orderId: order._id,
      deliveryPartner: req.user._id,
    });

    return res
      .status(200)
      .json({ success: true, order, message: `Order ${status}` });
  } catch (error) {
    console.error("Update Delivery Status Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// 4️⃣ DELIVERY DASHBOARD
// --------------------------------------------------
exports.deliveryDashboard = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findOne({ user: req.user._id });
    if (!partner)
      return res.status(404).json({ success: false, message: "Delivery partner not found" });

    const completedOrders = await Order.countDocuments({
      deliveryPartner: req.user._id,
      orderStatus: "Delivered",
    });
    const activeOrders = await Order.find({
      deliveryPartner: req.user._id,
      orderStatus: { $in: ["Accepted", "On the Way"] },
    });

    return res.status(200).json({
      success: true,
      deliveryPartner: {
        earnings: partner.earnings,
        completedOrders,
        activeOrders,
        isOnline: partner.isOnline,
      },
    });
  } catch (error) {
    console.error("Delivery Dashboard Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// 5️⃣ GET DELIVERY PROFILE
// --------------------------------------------------
exports.getDeliveryProfile = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id);

    if (!partner || !user)
      return res.status(404).json({ success: false, message: "Delivery partner not found" });

    return res.status(200).json({
      success: true,
      deliveryPartner: {
        name: user.name,
        email: user.email,
        phone: partner.phone,
        vehicle: partner.vehicle,
        experience: partner.experience,
        emergencyContact: partner.emergencyContact,
        profilePhoto: partner.avatar || "",
        licenseImage: partner.idProof || "",
        totalDeliveries: partner.totalDeliveries || 0,
        rating: partner.rating || 0,
        earnings: partner.earnings || 0,
        isOnline: partner.isOnline,
      },
    });
  } catch (error) {
    console.error("Get Delivery Profile Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// 6️⃣ UPDATE DELIVERY PROFILE (FULL EDITABLE VERSION)
// --------------------------------------------------
exports.updateDeliveryProfile = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id);

    if (!partner || !user)
      return res.status(404).json({ success: false, message: "Delivery partner not found" });

    const {
      name,
      email,
      phone,
      vehicle,
      experience,
      emergencyContact,
    } = req.body;

    // ✅ Update User fields safely
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    await user.save();

    // ✅ Update DeliveryPartner fields safely
    if (phone !== undefined) partner.phone = phone;
    if (vehicle !== undefined && ["Bike", "Scooter", "Cycle", "Walk"].includes(vehicle))
      partner.vehicle = vehicle;
    if (experience !== undefined) partner.experience = experience;
    if (emergencyContact !== undefined) partner.emergencyContact = emergencyContact;

    // ✅ Handle files
    const profilePhoto = req.files?.profilePhoto?.[0]?.path;
    const licenseImage = req.files?.licenseImage?.[0]?.path;

    if (profilePhoto) partner.avatar = profilePhoto;
    if (licenseImage) partner.idProof = licenseImage;

    await partner.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      deliveryPartner: {
        name: user.name,
        email: user.email,
        phone: partner.phone,
        vehicle: partner.vehicle,
        experience: partner.experience,
        emergencyContact: partner.emergencyContact,
        profilePhoto: partner.avatar,
        licenseImage: partner.idProof,
        totalDeliveries: partner.totalDeliveries,
        rating: partner.rating,
        earnings: partner.earnings,
        isOnline: partner.isOnline,
      },
    });
  } catch (error) {
    console.error("Update Delivery Profile Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};













