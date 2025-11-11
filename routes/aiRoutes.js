// backend/routes/aiRoutes.js
const express = require("express");
const router = express.Router();

const {
  aiChat,
  aiRecommendFood,
  aiHealthyMeals,
} = require("../controllers/aiController");

const { protect } = require("../middlewares/authMiddleware");

// --------------------------------------------------
// ✅ AI CHAT ASSISTANT
// --------------------------------------------------
router.post(
  "/chat",
  protect,
  aiChat
);

// --------------------------------------------------
// ✅ AI FOOD RECOMMENDATION
// (based on mood, diet, craving)
// --------------------------------------------------
router.post(
  "/recommend",
  protect,
  aiRecommendFood
);

// --------------------------------------------------
// ✅ AI HEALTHY MEAL SUGGESTIONS
// --------------------------------------------------
router.post(
  "/healthy",
  protect,
  aiHealthyMeals
);

module.exports = router;

