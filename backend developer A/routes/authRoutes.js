const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Login route
router.post('/login', authController.login);

// Renew membership route (TC_LOG_005)
router.post('/renew-membership', authController.renewMembership);

// Password recovery/reset
router.post('/reset-password', authController.resetPassword);

// Get current user profile
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      membershipStatus: req.user.membershipStatus
    }
  });
});

module.exports = router;