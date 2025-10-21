const Order = require('../models/Order');

// Get pending orders
exports.getPendingOrders = async (req, res) => {
  const orders = await Order.find({ status: 'pending' }).populate('items.dish');
  res.status(200).json({ orders });
};

// Accept / Reject Order
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body; // accepted, out_for_delivery, delivered
  const order = await Order.findById(orderId);

  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.status = status;
  if (status === 'delivered') order.deliveredAt = Date.now();
  await order.save();

  // Emit socket event
  const { io } = require('../socket');
  io.to(`order_${orderId}`).emit('orderStatusUpdated', status);

  res.status(200).json({ message: 'Order status updated', order });
};

// Delivery partner earnings
exports.getEarnings = async (req, res) => {
  const deliveredOrders = await Order.find({ deliveryPartner: req.user._id, status: 'delivered' });
  const earnings = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  res.status(200).json({ earnings });
};
