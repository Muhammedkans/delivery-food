// backend/routes/deliveryRoutes.js
const express = require("express");
const router = express.Router();

const {
  toggleOnlineStatus,
  updateLocation,
  acceptOrder,
  rejectOrder,
  markPickedUp,
  markDelivered,
  deliveryDashboard,
} = require("../controllers/deliveryController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// --------------------------------------------------
// ✅ DELIVERY PARTNER ONLINE/OFFLINE
// --------------------------------------------------
router.put(
  "/online",
  protect,
  authorizeRoles("delivery"),
  toggleOnlineStatus
);

// --------------------------------------------------
// ✅ LIVE LOCATION UPDATE
// --------------------------------------------------
router.put(
  "/location",
  protect,
  authorizeRoles("delivery"),
  updateLocation
);

// --------------------------------------------------
// ✅ ACCEPT ORDER
// --------------------------------------------------
router.put(
  "/accept/:orderId",
  protect,
  authorizeRoles("delivery"),
  acceptOrder
);

// --------------------------------------------------
// ✅ REJECT ORDER
// --------------------------------------------------
router.put(
  "/reject/:orderId",
  protect,
  authorizeRoles("delivery"),
  rejectOrder
);

// --------------------------------------------------
// ✅ MARK PICKED UP
// --------------------------------------------------
router.put(
  "/picked-up/:orderId",
  protect,
  authorizeRoles("delivery"),
  markPickedUp
);

// --------------------------------------------------
// ✅ MARK DELIVERED
// --------------------------------------------------
router.put(
  "/delivered/:orderId",
  protect,
  authorizeRoles("delivery"),
  markDelivered
);

// --------------------------------------------------
// ✅ DELIVERY DASHBOARD
// --------------------------------------------------
router.get(
  "/dashboard",
  protect,
  authorizeRoles("delivery"),
  deliveryDashboard
);

module.exports = router;

