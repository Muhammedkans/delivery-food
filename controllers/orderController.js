const Order = require('../models/Order');
const calcTotalPrice = require('../utils/calcOrder');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Customer
exports.placeOrder = async (req, res) => {
  try {
    const { restaurantId, items } = req.body;

    // Validation
    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Restaurant and items are required' });
    }

    // Calculate total price
    const totalPrice = await calcTotalPrice(items);

    const order = await Order.create({
      userId: req.user._id,
      restaurantId,
      items,
      totalPrice,
      status: 'pending',
    });

    // Emit real-time new order event for restaurant
    const io = req.app.get('io');
    io.to(restaurantId.toString()).emit('newOrder', order);

    res.status(201).json(order);
  } catch (error) {
    console.error('Place Order Error:', error);
    res.status(500).json({ message: 'Server error placing order', error: error.message });
  }
};

// @desc    Update order status or assign delivery boy
// @route   PUT /api/orders/:id
// @access  Admin / Restaurant / Driver
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Update status and/or deliveryBoyId
    order.status = req.body.status || order.status;
    order.deliveryBoyId = req.body.deliveryBoyId || order.deliveryBoyId;

    await order.save();

    const io = req.app.get('io');
    io.to(order._id.toString()).emit('orderStatusUpdate', order.status);

    if (req.body.deliveryLocation) {
      io.to(order._id.toString()).emit('deliveryLocationUpdate', req.body.deliveryLocation);
    }

    res.json(order);
  } catch (error) {
    console.error('Update Order Error:', error);
    res.status(500).json({ message: 'Server error updating order', error: error.message });
  }
};

// @desc    Get all orders for a user (customer)
// @route   GET /api/orders/user
// @access  Customer
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('restaurantId', 'name location image')
      .populate('deliveryBoyId', 'name location status');
    res.json(orders);
  } catch (error) {
    console.error('Get User Orders Error:', error);
    res.status(500).json({ message: 'Server error fetching user orders', error: error.message });
  }
};

// @desc    Get a single order by ID (for tracking)
// @route   GET /api/orders/:id
// @access  Customer / Admin / Restaurant / Driver
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurantId', 'name location image')
      .populate('deliveryBoyId', 'name location status');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    console.error('Get Order By ID Error:', error);
    res.status(500).json({ message: 'Server error fetching order', error: error.message });
  }
};

