const { generateAIResponse } = require('../utils/aiHelper');

// AI Chatbot
exports.chatbot = async (req, res) => {
  const { message } = req.body;
  const response = await generateAIResponse(message);
  res.status(200).json({ response });
};

// AI Recommendations
exports.recommendation = async (req, res) => {
  const { userId } = req.body;
  // Simple logic: Recommend top dishes (placeholder)
  const topDishes = [
    { name: 'Paneer Butter Masala', restaurant: 'Restaurant A' },
    { name: 'Margherita Pizza', restaurant: 'Restaurant B' },
  ];
  res.status(200).json({ recommendations: topDishes });
};

// AI Review Analysis
exports.reviewAnalysis = async (req, res) => {
  const { reviews } = req.body; // Array of review texts
  const analysis = reviews.map(r => ({
    review: r,
    sentiment: r.includes('bad') ? 'negative' : 'positive',
  }));
  res.status(200).json({ analysis });
};

