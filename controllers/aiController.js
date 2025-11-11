// backend/controllers/aiController.js
const OpenAI = require("openai");
const ChatMessage = require("../models/ChatMessage");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --------------------------------------------------
// ✅ AI FOOD ASSISTANT CHAT
// --------------------------------------------------
exports.aiChat = async (req, res) => {
  try {
    const { prompt, orderId } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    // ✅ Generate AI response
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an intelligent food assistant. You recommend dishes, restaurants, and diet plans like Swiggy, Zomato, and UberEats AI.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 250,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;

    // ✅ If conversation attached to an order → save message
    let savedMessage = null;

    if (orderId) {
      savedMessage = await ChatMessage.create({
        order: orderId,
        sender: req.user._id,
        receiver: req.user._id,
        message: reply,
        messageType: "ai",
        socketRoomId: orderId.toString(),
      });

      // ✅ Emit real-time AI message
      req.io.to(orderId.toString()).emit("new_message", savedMessage);
    }

    res.status(200).json({
      success: true,
      reply,
      savedMessage,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({
      success: false,
      message: "AI chat failed",
    });
  }
};

// --------------------------------------------------
// ✅ AI FOOD RECOMMENDATION BASED ON USER INPUT
// --------------------------------------------------
exports.aiRecommendFood = async (req, res) => {
  try {
    const { mood, diet, craving } = req.body;

    const prompt = `
    Suggest 5 food items based on:
    Mood: ${mood}
    Diet: ${diet}
    Craving: ${craving}
    Format:
    - Dish name
    - Short description
    - Veg/Non-veg
    - Best cuisine match
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a food recommendation engine." },
        { role: "user", content: prompt },
      ],
    });

    const reply = completion.choices[0].message.content;

    res.status(200).json({
      success: true,
      recommendations: reply,
    });
  } catch (error) {
    console.error("AI Recommend Food Error:", error);
    res.status(500).json({
      success: false,
      message: "AI recommendation failed",
    });
  }
};

// --------------------------------------------------
// ✅ AI HEALTHY MEAL SUGGESTIONS
// --------------------------------------------------
exports.aiHealthyMeals = async (req, res) => {
  try {
    const { goal } = req.body;

    const prompt = `
    Suggest 5 healthy meals for the goal: ${goal}.
    Include:
    - Calories (approx)
    - Ingredients
    - Why it's good
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional nutrition AI." },
        { role: "user", content: prompt },
      ],
    });

    const reply = completion.choices[0].message.content;

    res.status(200).json({
      success: true,
      meals: reply,
    });
  } catch (error) {
    console.error("AI Healthy Meals Error:", error);
    res.status(500).json({
      success: false,
      message: "AI healthy meal suggestion failed",
    });
  }
};

