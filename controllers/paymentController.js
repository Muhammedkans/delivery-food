const Razorpay = require('razorpay');
const Order = require('../models/Order');
const crypto = require('crypto');

// Initialize Razorpay instance
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay payment order
// @route   POST /api/payments/create
// @access  Customer
exports.createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const options = {
      amount: Math.round(order.totalPrice * 100), // amount in paise
      currency: 'INR',
      receipt: order._id.toString(),
      payment_capture: 1, // auto-capture
    };

    const paymentOrder = await instance.orders.create(options);

    res.status(200).json({
      id: paymentOrder.id,
      currency: paymentOrder.currency,
      amount: paymentOrder.amount,
      orderId: order._id,
    });
  } catch (error) {
    console.error('Payment Order Creation Error:', error);
    res.status(500).json({ message: 'Payment order creation failed', error: error.message });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Customer
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment details' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Payment verified - you can update order status here if needed
    const order = await Order.findOne({ _id: req.body.orderId });
    if (order) {
      order.status = 'paid';
      await order.save();
    }

    res.status(200).json({ message: 'Payment verified successfully', orderId: req.body.orderId });
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
};


