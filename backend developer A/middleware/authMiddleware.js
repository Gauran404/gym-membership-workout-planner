const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT Token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'supersecretkey123'
      );

      const userId = decoded.userId || decoded.id;
      req.user = await User.findById(userId).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }

      return next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: 'Not authorized, token failed or expired' });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Not authorized, no token provided' });
  }
};

// Role-Based Authorization Guard (Task 2.1.2)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user?.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };