// backend/routes/deliveryRoutes.js

const express = require("express");
const router = express.Router();

const {
  toggleOnlineStatus,
  updateLocation,
  updateDeliveryStatus,
  deliveryDashboard,
  getDeliveryProfile,
  updateDeliveryProfile,
} = require("../controllers/deliveryController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// ⭐ File upload middleware for delivery profile
const { uploadDeliveryProfile } = require("../middleware/upload");

// --------------------------------------------------
// 🚀 TOGGLE ONLINE / OFFLINE
// --------------------------------------------------
router.put(
  "/online",
  protect,
  authorizeRoles("delivery"),
  toggleOnlineStatus
);

// --------------------------------------------------
// 📍 UPDATE LIVE LOCATION
// --------------------------------------------------
router.put(
  "/location",
  protect,
  authorizeRoles("delivery"),
  updateLocation
);

// --------------------------------------------------
// 📦 UPDATE DELIVERY STATUS
// --------------------------------------------------
router.put(
  "/status/:orderId",
  protect,
  authorizeRoles("delivery"),
  updateDeliveryStatus
);

// --------------------------------------------------
// 📊 DELIVERY DASHBOARD
// --------------------------------------------------
router.get(
  "/dashboard",
  protect,
  authorizeRoles("delivery"),
  deliveryDashboard
);

// --------------------------------------------------
// 👤 GET DELIVERY PROFILE
// --------------------------------------------------
router.get(
  "/profile",
  protect,
  authorizeRoles("delivery"),
  getDeliveryProfile
);

// --------------------------------------------------
// ✏️ UPDATE DELIVERY PROFILE (Editable + profilePhoto + licenseImage)
// --------------------------------------------------
router.put(
  "/profile",
  protect,
  authorizeRoles("delivery"),
  uploadDeliveryProfile, // Handles profilePhoto + licenseImage uploads
  updateDeliveryProfile
);

module.exports = router;









