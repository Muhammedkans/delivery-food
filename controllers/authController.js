// backend/controllers/authController.js
const User = require("../models/User");
const DeliveryPartner = require("../models/DeliveryPartner");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");

// ------------------------------
// ✅ CUSTOMER SIGNUP
// ------------------------------
exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check existing user
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role: "customer",
    });

    generateToken(user, 201, res);
  } catch (error) {
    console.error("Customer Register Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------------------
// ✅ CUSTOMER LOGIN
// ------------------------------
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || user.role !== "customer") {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    generateToken(user, 200, res);
  } catch (error) {
    console.error("Customer Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------------------
// ✅ RESTAURANT SIGNUP
// ------------------------------
exports.registerRestaurant = async (req, res) => {
  try {
    const { name, email, password, phone, restaurantName, gstNumber, fssaiNumber } = req.body;

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "restaurant",
      restaurantDetails: {
        restaurantName,
        gstNumber,
        fssaiNumber,
        isApproved: false, // admin must approve
      },
    });

    generateToken(user, 201, res);
  } catch (error) {
    console.error("Restaurant Register Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------------------
// ✅ RESTAURANT LOGIN
// ------------------------------
exports.loginRestaurant = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || user.role !== "restaurant") {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.restaurantDetails.isApproved) {
      return res.status(403).json({ success: false, message: "Restaurant not approved by admin" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    generateToken(user, 200, res);
  } catch (error) {
    console.error("Restaurant Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------------------
// ✅ DELIVERY PARTNER SIGNUP
// ------------------------------
exports.registerDeliveryPartner = async (req, res) => {
  try {
    const { name, email, password, phone, vehicleNumber, drivingLicense } = req.body;

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "delivery",
      deliveryDetails: {
        vehicleNumber,
        drivingLicense,
      },
    });

    // Create delivery partner extra profile
    await DeliveryPartner.create({
      user: user._id,
      vehicleNumber,
    });

    generateToken(user, 201, res);
  } catch (error) {
    console.error("Delivery Register Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------------------
// ✅ DELIVERY PARTNER LOGIN
// ------------------------------
exports.loginDeliveryPartner = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || user.role !== "delivery") {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    generateToken(user, 200, res);
  } catch (error) {
    console.error("Delivery Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------------------
// ✅ ADMIN LOGIN
// ------------------------------
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email }).select("+password");

    if (!admin || admin.role !== "admin") {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    generateToken(admin, 200, res);
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------------------
// ✅ LOGOUT
// ------------------------------
exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

