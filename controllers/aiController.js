// backend/src/controllers/aiController.js
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

let openaiClient = null;

// Initialize OpenAI client if API key is available
if (process.env.OPENAI_API_KEY) {
  try {
    const OpenAI = require('openai');
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (e) {
    console.warn('OpenAI client not available:', e.message);
    openaiClient = null;
  }
}

// @desc    Get AI-powered or fallback dish suggestions for a user
// @route   GET /api/ai/suggestions
// @access  Customer
exports.getSuggestions = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1️⃣ Load user's past orders
    const userOrders = await Order.find({ userId }).populate('items.menuItemId');

    // Build a list of past dish names
    const pastDishNames = [];
    userOrders.forEach(order => {
      order.items.forEach(it => {
        if (it.menuItemId && it.menuItemId.name) pastDishNames.push(it.menuItemId.name);
      });
    });

    // 2️⃣ Fallback simple recommender (most frequent)
    const simpleRecommender = () => {
      const freq = {};
      pastDishNames.forEach(n => { freq[n] = (freq[n] || 0) + 1; });
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
      return sorted.slice(0, 5).map(([name]) => name);
    };

    // 3️⃣ AI-powered suggestions using OpenAI if available
    if (openaiClient) {
      try {
        const prompt = `
User has previously ordered: ${pastDishNames.join(', ') || 'No history'}.
Suggest up to 6 dish names (only names, comma separated) that this user would likely enjoy based on their history. Prefer popular related items.
`;

        const response = await openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
        });

        const text = response.choices?.[0]?.message?.content || '';
        const aiItems = text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);

        // Match AI names to MenuItem DB
        const matched = await MenuItem.find({ name: { $in: aiItems } }).limit(8);
        if (matched.length > 0) {
          return res.json({ source: 'openai_matched', suggestions: matched });
        }

        // If no matches, return raw AI names
        return res.json({ source: 'openai_raw', suggestions: aiItems.slice(0, 6) });
      } catch (aiErr) {
        console.error('OpenAI error, falling back to simple recommender:', aiErr);
        const fallbackNames = simpleRecommender();
        const matched = await MenuItem.find({ name: { $in: fallbackNames } }).limit(8);
        return res.json({ source: 'fallback_after_openai_error', suggestions: matched });
      }
    }

    // 4️⃣ No OpenAI -> use simple recommender
    const fallbackNames = simpleRecommender();
    const matchedItems = await MenuItem.find({ name: { $in: fallbackNames } }).limit(8);
    return res.json({ source: 'simple', suggestions: matchedItems });
  } catch (err) {
    console.error('AI suggestion failed:', err);
    res.status(500).json({ message: 'Failed to get AI suggestions', error: err.message });
  }
};




