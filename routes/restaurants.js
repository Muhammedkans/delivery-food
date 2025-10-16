// backend/src/routes/restaurants.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
} = require('../controllers/restaurantController');

const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');

// ✅ Get all restaurants
router.get('/', asyncHandler(getRestaurants));

// ✅ Get single restaurant by ID
router.get('/:id', asyncHandler(getRestaurantById));

// ✅ Create a new restaurant (Only restaurant users)
router.post(
  '/',
  protect,
  authorize('restaurant'), // Only restaurant role
  [
    body('name').notEmpty().withMessage('Restaurant name is required'),
    body('location.lat')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Valid latitude is required'),
    body('location.lng')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Valid longitude is required'),
    body('offers').optional().isArray().withMessage('Offers must be an array of strings'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await createRestaurant(req, res);
  })
);

module.exports = router;



