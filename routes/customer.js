const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getCustomerOrders,
  getFavorites,
  addFavorite,
  removeFavorite,
  getProfile,
  updateProfile,
} = require('../controllers/customerController');

// All routes protected (JWT required)
router.use(protect);

// Get customer profile
router.get('/profile', getProfile);

// Update customer profile
router.put('/profile', updateProfile);

// Get customer orders
router.get('/orders', getCustomerOrders);

// Favorites
router.get('/favorites', getFavorites);          // List favorites
router.post('/favorites', addFavorite);          // Add dish to favorites
router.delete('/favorites/:dishId', removeFavorite); // Remove dish from favorites

module.exports = router;
