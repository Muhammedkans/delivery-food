// backend/src/routes/payments.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

const { createPaymentOrder, verifyPayment } = require('../controllers/paymentController');

const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');

// Only logged-in customers can create Razorpay payment orders
router.post(
  '/razorpay',
  protect,
  authorize('customer'),
  [
    body('orderId').notEmpty().withMessage('Order ID is required').isMongoId()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    await createPaymentOrder(req, res);
  })
);

// Optional: verify payment signature
router.post(
  '/verify',
  protect,
  authorize('customer'),
  [
    body('razorpay_order_id').notEmpty().withMessage('Razorpay order ID is required'),
    body('razorpay_payment_id').notEmpty().withMessage('Razorpay payment ID is required'),
    body('razorpay_signature').notEmpty().withMessage('Razorpay signature is required')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    await verifyPayment(req, res);
  })
);

module.exports = router;



