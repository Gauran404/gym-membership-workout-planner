const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// Regex for standard email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.login = async (req, res) => {
  const { email, username, password } = req.body;
  const identifier = (email || username || '').trim();
  const cleanPassword = (password || '').trim();

  // TC_LOG_003: Empty email and password
  if (!identifier || !cleanPassword) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and password are required' 
    });
  }

  // TC_LOG_004: Invalid email format
  if (!emailRegex.test(identifier)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Enter a valid email address' 
    });
  }

  try {
    // 1. Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    // TC_LOG_002: Invalid email or password
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password',
        failedAttempts: 1,
        allowReset: false 
      });
    }

    // 2. Check if account is locked out
    if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockoutUntil - Date.now()) / 1000 / 60);
      return res.status(429).json({ 
        success: false,
        message: `Account locked due to failed attempts. Please try again in ${remainingMinutes} minute(s).`,
        failedAttempts: user.failedLoginAttempts,
        allowReset: true
      });
    }

    // 3. Verify password
    const isMatch = await user.comparePassword(cleanPassword);

    // TC_LOG_002: Invalid password
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 5 * 60 * 1000);
      }
      await user.save();

      const allowReset = user.failedLoginAttempts >= 3;
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password',
        failedAttempts: user.failedLoginAttempts,
        allowReset
      });
    }

    // TC_LOG_005: Expired membership check
    if (user.membershipStatus === 'Expired') {
      return res.status(403).json({
        success: false,
        message: 'Your membership has expired. Please renew',
        expired: true,
        email: user.email
      });
    }

    // 4. Reset failed attempts on success
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    await user.save();

    // 5. Generate JWT token
    const token = jwt.sign(
      { userId: user._id, id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // TC_LOG_001: Success
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipStatus: user.membershipStatus
      }
    });

  } catch (error) {
    console.error('Auth controller error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication', 
      error: error.message 
    });
  }
};

// Renew membership endpoint for TC_LOG_005
exports.renewMembership = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required to renew membership' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Member account not found' });
    }

    user.membershipStatus = 'Active';
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Membership renewed successfully! You can now log in.'
    });
  } catch (error) {
    console.error('Membership renewal error:', error);
    return res.status(500).json({ success: false, message: 'Error renewing membership', error: error.message });
  }
};

// Generate and set a new password after 3 failed login attempts
exports.resetPassword = async (req, res) => {
  const { email, username, newPassword } = req.body;
  const identifier = email || username;

  if (!identifier) {
    return res.status(400).json({ message: 'Email or username is required' });
  }

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found with provided email/username' });
    }

    const generatedPassword = (newPassword && newPassword.trim()) 
      ? newPassword.trim() 
      : 'pass' + Math.floor(1000 + Math.random() * 9000);

    user.password = generatedPassword;
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'New password successfully generated and updated!',
      newPassword: generatedPassword,
      email: user.email
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};