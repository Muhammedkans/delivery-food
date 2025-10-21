require('dotenv').config();  // 👈 Add this line first

const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 👈 Make sure the name matches your .env file
});

exports.generateAIResponse = async (message) => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: message }],
  });

  return completion.choices[0].message.content;
};

