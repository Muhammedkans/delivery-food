// backend/src/routes/drivers.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

const { updateLocation } = require('../controllers/driverController');

const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');

// Only drivers can update their current location
router.put(
  '/location',
  protect,
  authorize('driver'),
  [
    body('lat').notEmpty().withMessage('Latitude is required').isFloat(),
    body('lng').notEmpty().withMessage('Longitude is required').isFloat(),
    body('orderId').optional().isMongoId().withMessage('Valid order ID required')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await updateLocation(req, res);
  })
);

module.exports = router;


