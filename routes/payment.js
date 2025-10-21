const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createOrder, verifyPayment } = require('../controllers/paymentController');

router.use(protect);

// Create Razorpay order
router.post('/create-order', createOrder);

// Verify payment (frontend webhook)
router.post('/verify', verifyPayment);

module.exports = router;
