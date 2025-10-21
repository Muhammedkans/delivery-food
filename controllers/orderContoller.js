const Razorpay = require('razorpay');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Checkout — create Razorpay order
exports.checkout = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.dish');
  if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

  const amount = cart.items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0) * 100; // in paise

  const options = {
    amount,
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);
  res.status(200).json({ order });
};

// Confirm Payment & Create Order
exports.confirmPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id } = req.body;
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.dish');
  if (!cart) return res.status(400).json({ message: 'Cart is empty' });

  const totalAmount = cart.items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

  // Create Order in DB
  const order = await Order.create({
    user: req.user._id,
    restaurant: cart.items[0].dish.restaurant, // assume all dishes from same restaurant
    items: cart.items.map(item => ({ dish: item.dish._id, quantity: item.quantity })),
    totalAmount,
    status: 'pending',
    paymentStatus: 'paid',
  });

  // Clear cart
  cart.items = [];
  await cart.save();

  res.status(200).json({ message: 'Order placed successfully', order });
};

// Customer Orders
exports.getCustomerOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate('items.dish');
  res.status(200).json({ orders });
};
