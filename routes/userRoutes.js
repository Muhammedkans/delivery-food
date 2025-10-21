const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Get user profile
router.get('/profile', protect, getProfile);

// Update profile (with optional profile image)
router.put('/profile', protect, upload.single('profileImage'), updateProfile);

module.exports = router;

