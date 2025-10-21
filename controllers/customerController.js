const Order = require('../models/Order');
const User = require('../models/User');
const Dish = require('../models/Dish');

// Get customer profile
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.status(200).json({ user });
};

// Update profile
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, email }, { new: true });
  res.status(200).json({ message: 'Profile updated', user });
};

// Get orders
exports.getCustomerOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate('items.dish');
  res.status(200).json({ orders });
};

// Favorites (simplified as array of dish IDs)
exports.getFavorites = async (req, res) => {
  const user = await User.findById(req.user._id).populate('favorites');
  res.status(200).json({ favorites: user.favorites });
};

exports.addFavorite = async (req, res) => {
  const { dishId } = req.body;
  const user = await User.findById(req.user._id);
  if (!user.favorites.includes(dishId)) {
    user.favorites.push(dishId);
    await user.save();
  }
  res.status(200).json({ message: 'Added to favorites', favorites: user.favorites });
};

exports.removeFavorite = async (req, res) => {
  const { dishId } = req.params;
  const user = await User.findById(req.user._id);
  user.favorites = user.favorites.filter((id) => id.toString() !== dishId);
  await user.save();
  res.status(200).json({ message: 'Removed from favorites', favorites: user.favorites });
};
