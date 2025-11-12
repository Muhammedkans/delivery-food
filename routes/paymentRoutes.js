// backend/routes/paymentRoutes.js
const express = require("express");
const router = express.Router();

const {
  createPaymentOrder,
  verifyPayment,
  paymentFailed,
} = require("../controllers/paymentController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// --------------------------------------------------
// ✅ CREATE RAZORPAY ORDER (CUSTOMER)
// --------------------------------------------------
router.post(
  "/order",
  protect,
  authorizeRoles("customer"),
  createPaymentOrder
);

// --------------------------------------------------
// ✅ VERIFY PAYMENT SIGNATURE (CUSTOMER)
// --------------------------------------------------
router.post(
  "/verify",
  protect,
  authorizeRoles("customer"),
  verifyPayment
);

// --------------------------------------------------
// ✅ PAYMENT FAILED
// --------------------------------------------------
router.post(
  "/failed",
  protect,
  authorizeRoles("customer"),
  paymentFailed
);

module.exports = router;

