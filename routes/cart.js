const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} = require('../controllers/cartController');

const {
  checkout,
  confirmPayment,
  getCustomerOrders,
} = require('../controllers/orderContoller');

router.use(protect);

// Cart routes
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.put('/cart', updateCartItem);
router.delete('/cart', removeFromCart);

// Checkout & Payment
router.post('/checkout', checkout);
router.post('/confirm', confirmPayment);

// Customer orders
router.get('/myorders', getCustomerOrders);

module.exports = router;
