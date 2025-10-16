// backend/src/middleware/roles.js
const asyncHandler = require('express-async-handler');

const authorize = (...allowedRoles) => {
  return asyncHandler((req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: Access denied' });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error.message);
      res.status(500).json({ message: 'Server error in authorization' });
    }
  });
};

module.exports = authorize;

