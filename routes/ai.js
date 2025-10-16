// backend/src/routes/ai.js
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

const { getSuggestions } = require('../controllers/aiController');

const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');

// Only logged-in customers can access AI-based food suggestions
router.get(
  '/suggestions',
  protect,
  authorize('customer'),
  asyncHandler(async (req, res) => {
    await getSuggestions(req, res);
  })
);

module.exports = router;


