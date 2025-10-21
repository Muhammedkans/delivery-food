const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { chatbot, recommendation, reviewAnalysis } = require('../controllers/aiController');

router.use(protect);

router.post('/chatbot', chatbot);
router.post('/recommendation', recommendation);
router.post('/review-analysis', reviewAnalysis);

module.exports = router;
