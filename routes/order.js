// backend/src/routes/orders.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

const {
  placeOrder,
  updateOrderStatus,
  getUserOrders,
  getOrderById
} = require('../controllers/orderController');

const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');

// 🟢 Customer places a new order
router.post(
  '/',
  protect,
  authorize('customer'),
  [
    body('restaurantId').notEmpty().withMessage('Restaurant ID is required'),
    body('items')
      .isArray({ min: 1 })
      .withMessage('Items array is required and cannot be empty'),
    body('items.*.menuItemId').notEmpty().withMessage('Menu item ID is required'),
    body('items.*.quantity')
      .isInt({ gt: 0 })
      .withMessage('Quantity must be a positive integer')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await placeOrder(req, res);
  })
);

// 🟢 Restaurant or Driver updates order status (e.g., preparing, on the way)
router.put(
  '/:id',
  protect,
  authorize('restaurant', 'driver'),
  [
    body('status')
      .optional()
      .isIn(['pending', 'accepted', 'preparing', 'on the way', 'delivered'])
      .withMessage('Invalid status value'),
    body('deliveryBoyId').optional().isMongoId().withMessage('Valid driver ID required'),
    body('deliveryLocation')
      .optional()
      .custom((value) => {
        if (value.lat == null || value.lng == null) {
          throw new Error('Latitude and longitude are required in deliveryLocation');
        }
        return true;
      })
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await updateOrderStatus(req, res);
  })
);

// 🟢 Customer fetches all their orders
router.get('/', protect, authorize('customer'), asyncHandler(getUserOrders));

// 🟢 Fetch single order by ID (for tracking) - accessible to customer, restaurant, or driver
router.get('/:id', protect, asyncHandler(getOrderById));

module.exports = router;





