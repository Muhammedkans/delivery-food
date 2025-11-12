// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();

const {
  getAllCustomers,
  getAllRestaurants,
  approveRestaurant,
  toggleRestaurantBlock,
  getAllDeliveryPartners,
  getAllOrders,
  getAdminStats,
} = require("../controllers/adminController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// --------------------------------------------------
// ✅ ADMIN — GET ALL CUSTOMERS
// --------------------------------------------------
router.get(
  "/customers",
  protect,
  authorizeRoles("admin"),
  getAllCustomers
);

// --------------------------------------------------
// ✅ ADMIN — GET ALL RESTAURANTS
// --------------------------------------------------
router.get(
  "/restaurants",
  protect,
  authorizeRoles("admin"),
  getAllRestaurants
);

// --------------------------------------------------
// ✅ ADMIN — APPROVE RESTAURANT
// --------------------------------------------------
router.put(
  "/restaurants/approve/:restaurantId",
  protect,
  authorizeRoles("admin"),
  approveRestaurant
);

// --------------------------------------------------
// ✅ ADMIN — BLOCK / UNBLOCK RESTAURANT
// --------------------------------------------------
router.put(
  "/restaurants/block/:restaurantId",
  protect,
  authorizeRoles("admin"),
  toggleRestaurantBlock
);

// --------------------------------------------------
// ✅ ADMIN — GET ALL DELIVERY PARTNERS
// --------------------------------------------------
router.get(
  "/delivery-partners",
  protect,
  authorizeRoles("admin"),
  getAllDeliveryPartners
);

// --------------------------------------------------
// ✅ ADMIN — GET ALL ORDERS
// --------------------------------------------------
router.get(
  "/orders",
  protect,
  authorizeRoles("admin"),
  getAllOrders
);

// --------------------------------------------------
// ✅ ADMIN — DASHBOARD STATS
// --------------------------------------------------
router.get(
  "/stats",
  protect,
  authorizeRoles("admin"),
  getAdminStats
);

module.exports = router;

