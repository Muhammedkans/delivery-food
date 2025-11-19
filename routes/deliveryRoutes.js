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
const { protect } = require("../middleware/authMiddleware");
const { uploadDeliveryProfile, multerErrorHandler } = require("../middleware/upload"); // ✅ Correct import

// ----------------------------
// 1️⃣ TOGGLE ONLINE / OFFLINE
// ----------------------------
router.put("/online", protect, toggleOnlineStatus);

// ----------------------------
// 2️⃣ UPDATE LIVE LOCATION
// ----------------------------
router.put("/location", protect, updateLocation);

// ----------------------------
// 3️⃣ UPDATE ORDER STATUS
// ----------------------------
router.put("/status/:orderId", protect, updateDeliveryStatus);

// ----------------------------
// 4️⃣ DELIVERY DASHBOARD
// ----------------------------
router.get("/dashboard", protect, deliveryDashboard);

// ----------------------------
// 5️⃣ GET DELIVERY PROFILE
// ----------------------------
router.get("/profile", protect, getDeliveryProfile);

// ----------------------------
// 6️⃣ UPDATE DELIVERY PROFILE (with Multer for file upload)
// ----------------------------
router.put(
  "/profile",
  protect,
  uploadDeliveryProfile, // ✅ Use the correct exported middleware
  updateDeliveryProfile
);

// ----------------------------
// 7️⃣ Optional: Multer error handler
// ----------------------------
router.use(multerErrorHandler);

module.exports = router;

















