// backend/controllers/deliveryController.js

const mongoose = require("mongoose");
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
      status: { $in: ["On the Way", "Ready for Pickup"] },
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

    const partner = await DeliveryPartner.findOne({ user: req.user._id });
    if (!partner)
      return res.status(404).json({ success: false, message: "Delivery partner not found" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const deliveryPartnerId = partner._id?.toString();
    const allowedIds = [req.user._id.toString(), deliveryPartnerId];

    if (order.deliveryPartner && !allowedIds.includes(order.deliveryPartner.toString()))
      return res.status(403).json({ success: false, message: "Not authorized" });

    // Update status flow
    if (status === "Accepted") {
      order.status = "On the Way";
      order.deliveryPartner = partner._id;
    }
    if (status === "Rejected") {
      order.status = "Ready for Pickup";
      order.deliveryPartner = null;
    }
    if (status === "Picked Up") {
      order.status = "On the Way";
    }
    if (status === "Delivered") {
      order.status = "Delivered";
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
      deliveryPartner: partner._id,
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
    const partner = await DeliveryPartner.findOne({ user: req.user._id }).lean();
    if (!partner)
      return res.status(404).json({ success: false, message: "Delivery partner not found" });

    const userObjectId = typeof req.user._id === "string" ? new mongoose.Types.ObjectId(req.user._id) : req.user._id;
    const deliveryPartnerFilter = [userObjectId];
    if (partner?._id) deliveryPartnerFilter.push(partner._id);

    const baseMatch = { deliveryPartner: { $in: deliveryPartnerFilter } };

    const completedOrders = await Order.countDocuments({ ...baseMatch, status: "Delivered" });

    const activeOrdersRaw = await Order.find({
      ...baseMatch,
      status: { $in: ["Accepted", "Ready for Pickup", "On the Way", "Preparing"] },
    })
      .select(
        "customer restaurant totalPrice status createdAt timeline address deliveryTimeEstimate deliveryLocation"
      )
      .populate("customer", "name phone")
      .populate("restaurant", "name address")
      .lean();

    const activeOrders = activeOrdersRaw.map((order) => ({
      _id: order._id,
      customer: order.customer,
      restaurant: order.restaurant,
      total: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt,
      timeline: order.timeline,
      address: order.address,
      deliveryTimeEstimate: order.deliveryTimeEstimate,
      deliveryLocation: order.deliveryLocation,
    }));

    const assignedOrders = await Order.countDocuments(baseMatch);
    const rejectedOrders = await Order.countDocuments({ ...baseMatch, "timeline.status": "Rejected" });

    const acceptanceRate = assignedOrders === 0 ? 100 : Math.round(((assignedOrders - rejectedOrders) / Math.max(assignedOrders, 1)) * 100);
    const completionRate = assignedOrders === 0 ? 100 : Math.round((completedOrders / Math.max(assignedOrders, 1)) * 100);

    const recentDelivered = await Order.find({ ...baseMatch, status: "Delivered" })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("timeline createdAt deliveredAt");

    const deliveryDurations = recentDelivered
      .map((order) => {
        const start = order.timeline?.find((item) => ["Accepted", "Ready for Pickup", "On the Way"].includes(item.status))?.timestamp || order.createdAt;
        const end = order.deliveredAt || order.timeline?.find((item) => item.status === "Delivered")?.timestamp;
        if (!start || !end) return null;
        return (new Date(end) - new Date(start)) / 60000;
      })
      .filter((value) => typeof value === "number");

    const avgDeliveryTime = deliveryDurations.length ? Math.round(deliveryDurations.reduce((acc, curr) => acc + curr, 0) / deliveryDurations.length) : 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const weeklyAggregation = await Order.aggregate([
      { $match: { deliveryPartner: { $in: deliveryPartnerFilter }, status: "Delivered", updatedAt: { $gte: sevenDaysAgo } } },
      { $project: { day: { $dateToString: { format: "%Y-%m-%d", date: { $ifNull: ["$deliveredAt", "$updatedAt"] } } } } },
      { $group: { _id: "$day", orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const weeklyMap = weeklyAggregation.reduce((acc, entry) => { acc[entry._id] = entry.orders; return acc; }, {});
    const weeklySeries = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      const ordersCount = weeklyMap[key] || 0;
      weeklySeries.push({ label: date.toLocaleDateString("en-US", { weekday: "short" }), orders: ordersCount, earnings: ordersCount * 40 });
    }

    const todayEarnings = weeklySeries.length ? weeklySeries[weeklySeries.length - 1].earnings : 0;

    const deliveredDays = await Order.aggregate([
      { $match: { deliveryPartner: { $in: deliveryPartnerFilter }, status: "Delivered" } },
      { $project: { day: { $dateToString: { format: "%Y-%m-%d", date: { $ifNull: ["$deliveredAt", "$updatedAt"] } } } } },
      { $group: { _id: "$day" } },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);

    let streakDays = 0;
    let prevDate = null;
    for (const entry of deliveredDays) {
      const entryDate = new Date(entry._id);
      entryDate.setHours(0, 0, 0, 0);
      if (!prevDate) {
        const diffFromToday = Math.round((today - entryDate) / (24 * 60 * 60 * 1000));
        if (diffFromToday > 1) break;
        streakDays += 1;
        prevDate = entryDate;
        continue;
      }
      const diff = Math.round((prevDate - entryDate) / (24 * 60 * 60 * 1000));
      if (diff === 1) { streakDays += 1; prevDate = entryDate; } else break;
    }

    const payoutThreshold = 500;
    const completedPayouts = Math.floor((partner.earnings || 0) / payoutThreshold) * payoutThreshold;
    const pendingPayout = (partner.earnings || 0) - completedPayouts;

    return res.status(200).json({
      success: true,
      data: {
        summary: { activeOrders: activeOrders.length, completedOrders, earnings: partner.earnings || 0, todayEarnings, rating: partner.rating || 0, isOnline: partner.isOnline },
        insights: { acceptanceRate, completionRate, avgDeliveryTime, streakDays, pendingPayout, payoutThreshold },
        weeklyEarnings: weeklySeries,
        orders: activeOrders,
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
// 6️⃣ UPDATE DELIVERY PROFILE (SAFE & FINAL)
// --------------------------------------------------
// --------------------------------------------------
// 6️⃣ UPDATE DELIVERY PROFILE (CORRECTED)
// --------------------------------------------------
exports.updateDeliveryProfile = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id);

    if (!partner || !user)
      return res.status(404).json({ success: false, message: "Delivery partner not found" });

    console.log("🟢 BODY:", req.body);
    console.log("🟢 FILES:", req.files);

    const { name, email, phone, vehicle, experience, emergencyContact } = req.body;

    // -------------------------
    // Update User fields
    // -------------------------
    if (name && name.trim()) user.name = name.trim();
    if (email && email.trim()) {
      const emailExists = await User.findOne({ email: email.trim(), _id: { $ne: user._id } });
      if (emailExists) return res.status(400).json({ success: false, message: "Email is already in use" });
      user.email = email.trim();
    }
    await user.save();

    // -------------------------
    // Update Delivery Partner fields
    // -------------------------
    if (phone && phone.trim()) partner.phone = phone.trim();
    if (vehicle && vehicle.trim()) partner.vehicle = vehicle.trim();
    if (experience) partner.experience = Number(experience);
    if (emergencyContact && emergencyContact.trim()) partner.emergencyContact = emergencyContact.trim();

    // -------------------------
    // Update images (Cloudinary URLs)
    // -------------------------
    if (req.files?.profilePhoto?.[0]?.path) {
      partner.avatar = req.files.profilePhoto[0].path;
    }
    if (req.files?.licenseImage?.[0]?.path) {
      partner.idProof = req.files.licenseImage[0].path;
    }

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
    console.error("❌ Update Delivery Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again.",
      error: error.message,
    });
  }
};









