// backend/src/routes/menu.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

const {
  addMenuItem,
  getMenu,
  getMenuByRestaurant,
  getRecommendedItems,
  getCategories,
} = require('../controllers/menuController');

const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');

// 🧠 Public routes (customers)
router.get('/', asyncHandler(getMenu));
router.get('/categories', asyncHandler(getCategories));
router.get('/recommended', asyncHandler(getRecommendedItems));

// 🧑‍🍳 Restaurant dashboard routes (protected)
router.get(
  '/restaurant/:restaurantId',
  protect,
  authorize('restaurant'),
  asyncHandler(getMenuByRestaurant)
);

router.post(
  '/add',
  protect,
  authorize('restaurant'),
  [
    body('restaurantId').notEmpty().withMessage('Restaurant ID is required'),
    body('name').notEmpty().withMessage('Menu item name is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('category').optional().isString(),
    body('description').optional().isString(),
    body('image').optional().isString(),
    body('isRecommended').optional().isBoolean(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await addMenuItem(req, res);
  })
);

module.exports = router;



