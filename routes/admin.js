const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  blockUser,
  approveRestaurant,
  getAnalytics,
} = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.put('/block', blockUser);
router.put('/approve', approveRestaurant);
router.get('/analytics', getAnalytics);

module.exports = router;
