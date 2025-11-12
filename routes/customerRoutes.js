// backend/routes/customerRoutes.js
const express = require("express");
const router = express.Router();

const {
  getHomepageRestaurants,
  getMenu,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCart,
  placeOrder,
  getMyOrders,
  getActiveOrder,
} = require("../controllers/customerController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// --------------------------------------------------
// ✅ HOMEPAGE RESTAURANTS (PUBLIC)
// --------------------------------------------------
router.get("/restaurants", getHomepageRestaurants);

// --------------------------------------------------
// ✅ MENU OF A RESTAURANT (PUBLIC)
// --------------------------------------------------
router.get("/menu/:restaurantId", getMenu);

// --------------------------------------------------
// ✅ CART ROUTES (CUSTOMER ONLY)
// --------------------------------------------------
router.get(
  "/cart",
  protect,
  authorizeRoles("customer"),
  getCart
);

router.post(
  "/cart/add",
  protect,
  authorizeRoles("customer"),
  addToCart
);

router.put(
  "/cart/update",
  protect,
  authorizeRoles("customer"),
  updateCartItem
);

router.delete(
  "/cart/remove/:dishId",
  protect,
  authorizeRoles("customer"),
  removeFromCart
);

router.delete(
  "/cart/clear",
  protect,
  authorizeRoles("customer"),
  clearCart
);

// --------------------------------------------------
// ✅ PLACE ORDER
// --------------------------------------------------
router.post(
  "/order",
  protect,
  authorizeRoles("customer"),
  placeOrder
);

// --------------------------------------------------
// ✅ GET ALL MY ORDERS
// --------------------------------------------------
router.get(
  "/orders",
  protect,
  authorizeRoles("customer"),
  getMyOrders
);

// --------------------------------------------------
// ✅ ACTIVE ORDER TRACKING
// --------------------------------------------------
router.get(
  "/order/active",
  protect,
  authorizeRoles("customer"),
  getActiveOrder
);

module.exports = router;

