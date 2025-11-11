const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Dish = require("../models/Dish");

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = asyncHandler(async (req, res) => {
  const { status, paymentStatus } = req.query;

  const query = {};
  if (status) query.status = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  const orders = await Order.find(query)
    .populate("user", "name email phone")
    .populate("restaurant", "name logo")
    .populate("deliveryPerson", "name phone")
    .populate("items.dish", "name image price")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders,
  });
});

// @desc    Get single order
// @route   GET /api/orders/:orderId
// @access  Private
exports.getOrderDetails = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId)
    .populate("user", "name email phone")
    .populate("restaurant", "name image logo address")
    .populate("deliveryPerson", "name phone")
    .populate("items.dish", "name image price category");

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  // Check authorization
  const isAuthorized =
    req.user.role === "admin" ||
    order.user._id.toString() === req.user._id.toString() ||
    (order.restaurant.owner && order.restaurant.owner.toString() === req.user._id.toString());

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to view this order",
    });
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:orderId/status
// @access  Private (Admin/Restaurant/Delivery)
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const order = await Order.findById(orderId).populate("restaurant");

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  // Authorization check
  const isAuthorized =
    req.user.role === "admin" ||
    (order.restaurant.owner && order.restaurant.owner.toString() === req.user._id.toString()) ||
    (order.deliveryPerson && order.deliveryPerson.toString() === req.user._id.toString());

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this order",
    });
  }

  order.status = status;

  if (status === "ready") {
    order.estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000);
  }

  if (status === "delivered") {
    order.deliveredAt = new Date();
  }

  if (status === "cancelled") {
    order.cancelledAt = new Date();
    if (order.paymentStatus === "paid") {
      order.paymentStatus = "refunded";
    }
  }

  await order.save();

  // Emit socket event
  const { io } = require("../sockets/index");
  if (io) {
    io.to(`order_${orderId}`).emit("orderStatusUpdated", {
      orderId: order._id,
      status: order.status,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      deliveredAt: order.deliveredAt,
    });

    if (order.user) {
      io.to(`user_${order.user}`).emit("orderUpdate", {
        orderId: order._id,
        status: order.status,
      });
    }

    if (order.restaurant) {
      io.to(`restaurant_${order.restaurant._id || order.restaurant}`).emit("orderUpdate", {
        orderId: order._id,
        status: order.status,
      });
    }
  }

  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    order,
  });
});

// @desc    Get customer orders
// @route   GET /api/customer/orders
// @access  Private
exports.getCustomerOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const query = { user: req.user._id };
  if (status) query.status = status;

  const orders = await Order.find(query)
    .populate("restaurant", "name image logo")
    .populate("items.dish", "name image price")
    .populate("deliveryPerson", "name phone")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders,
  });
});

// @desc    Get single order details (Customer)
// @route   GET /api/customer/orders/:orderId
// @access  Private
exports.getOrderDetails = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
  })
    .populate("restaurant", "name image logo address contact")
    .populate("items.dish", "name image price category")
    .populate("deliveryPerson", "name phone");

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  res.status(200).json({
    success: true,
    order,
  });
});
