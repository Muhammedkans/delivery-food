const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// Controllers
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

// All routes require authentication
router.use(protect);

// Cart routes
router.get("/", getCart);
router.post("/", addToCart);
router.put("/:dishId", updateCartItem);
router.delete("/:dishId", removeFromCart);
router.delete("/", clearCart);

module.exports = router;


