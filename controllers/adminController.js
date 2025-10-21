const User = require('../models/User');
const Restaurant = require('../models/Restaurent');
const Dish = require('../models/Dish');
const Order = require('../models/Order');
const Review = require('../models/Review');

// Get all users
exports.getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.status(200).json({ users });
};

// Block/Unblock user
exports.blockUser = async (req, res) => {
  const { userId, block } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.isBlocked = block;
  await user.save();
  res.status(200).json({ message: `User ${block ? 'blocked' : 'unblocked'}` });
};

// Approve Restaurant
exports.approveRestaurant = async (req, res) => {
  const { restaurantId, approve } = req.body;
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

  restaurant.isApproved = approve;
  await restaurant.save();
  res.status(200).json({ message: `Restaurant ${approve ? 'approved' : 'disapproved'}` });
};

// Analytics
exports.getAnalytics = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalRestaurants = await Restaurant.countDocuments();
  const totalOrders = await Order.countDocuments();
  const totalSalesAgg = await Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } },
  ]);
  const totalSales = totalSalesAgg[0]?.totalSales || 0;

  res.status(200).json({
    totalUsers,
    totalRestaurants,
    totalOrders,
    totalSales,
  });
};

