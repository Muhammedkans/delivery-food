// backend/utils/generateToken.js
const jwt = require("jsonwebtoken");

const generateToken = (user, statusCode, res) => {
  const payload = {
    id: user._id,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  // Cookie Options
  const cookieOptions = {
    httpOnly: true, // prevents JS access
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict", // CSRF protection
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  res.cookie("token", token, cookieOptions);

  // Response
  res.status(statusCode).json({
    success: true,
    message: "Authentication successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

module.exports = generateToken;


