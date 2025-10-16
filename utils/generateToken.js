// backend/src/utils/generateToken.js
const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for a user
 * @param {String} userId - MongoDB user ID
 * @param {String} role - User role (customer, restaurant, driver)
 * @returns {String} JWT token
 */
const generateToken = (userId, role) => {
  if (!userId || !role) {
    throw new Error('User ID and role are required to generate token');
  }

  try {
    const token = jwt.sign(
      { id: userId, role },
      process.env.JWT_SECRET,
      {
        algorithm: 'HS256',       // explicit algorithm
        expiresIn: '7d',          // token valid for 7 days
      }
    );
    return token;
  } catch (error) {
    console.error('JWT token generation failed:', error.message);
    throw new Error('Failed to generate token');
  }
};

module.exports = generateToken;
