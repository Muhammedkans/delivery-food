const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getPendingOrders,
  updateOrderStatus,
  getEarnings,
} = require('../controllers/deliveryController');

router.use(protect);
router.use(authorize('delivery'));

// Delivery routes
router.get('/orders', getPendingOrders);
router.put('/status/:orderId', updateOrderStatus);
router.get('/earnings', getEarnings);

module.exports = router;
