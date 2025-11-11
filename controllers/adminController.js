// backend/controllers/adminController.js
const User = require("../models/User");
const Order = require("../models/Order");
const DeliveryPartner = require("../models/DeliveryPartner");

// --------------------------------------------------
// ✅ GET ALL USERS (Customers)
// --------------------------------------------------
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select("-password");

    res.status(200).json({
      success: true,
      customers,
    });
  } catch (error) {
    console.error("Get All Customers Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ GET ALL RESTAURANTS
// --------------------------------------------------
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await User.find({ role: "restaurant" }).select("-password");

    res.status(200).json({
      success: true,
      restaurants,
    });
  } catch (error) {
    console.error("Get All Restaurants Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ APPROVE RESTAURANT
// --------------------------------------------------
exports.approveRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await User.findById(restaurantId);

    if (!restaurant || restaurant.role !== "restaurant") {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    restaurant.restaurantDetails.isApproved = true;
    await restaurant.save();

    res.status(200).json({
      success: true,
      message: "Restaurant approved successfully",
    });
  } catch (error) {
    console.error("Approve Restaurant Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ BLOCK / UNBLOCK RESTAURANT
// --------------------------------------------------
exports.toggleRestaurantBlock = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await User.findById(restaurantId);

    if (!restaurant || restaurant.role !== "restaurant") {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    restaurant.restaurantDetails.isBlocked =
      !restaurant.restaurantDetails.isBlocked;

    await restaurant.save();

    res.status(200).json({
      success: true,
      message: `Restaurant is now ${
        restaurant.restaurantDetails.isBlocked ? "Blocked" : "Active"
      }`,
    });
  } catch (error) {
    console.error("Toggle Block Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ GET ALL DELIVERY PARTNERS
// --------------------------------------------------
exports.getAllDeliveryPartners = async (req, res) => {
  try {
    const partners = await User.find({ role: "delivery" }).select("-password");

    res.status(200).json({
      success: true,
      partners,
    });
  } catch (error) {
    console.error("Get Delivery Partners Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ GET ALL ORDERS
// --------------------------------------------------
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .populate("restaurant", "name restaurantDetails.restaurantName")
      .populate("deliveryPartner", "name email");

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------
// ✅ ADMIN DASHBOARD STATS
// --------------------------------------------------
exports.getAdminStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalRestaurants = await User.countDocuments({ role: "restaurant" });
    const totalDeliveryPartners = await User.countDocuments({ role: "delivery" });
    const totalOrders = await Order.countDocuments();
    const activeOrders = await Order.countDocuments({
      status: { $in: ["placed", "accepted", "picked_up"] },
    });

    const revenueAgg = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        totalRestaurants,
        totalDeliveryPartners,
        totalOrders,
        activeOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

