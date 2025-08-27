const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
require('../config/passport'); // make sure Passport config is loaded
const { protect } = require("../middleware/authMiddleware");

// Hardcoded admin email
const ADMIN_EMAIL = "nyanchongiorori@gmail.com";

// ==============================
// Google OAuth login
// ==============================
router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account' // always ask user to pick account
  })
);

// Google callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login` }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      {
        id: req.user._id,
        email: req.user.email,
        username: req.user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send token back as cookie + redirect
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.redirect(`${process.env.CLIENT_URL}`);
  }
);

// ==============================
// Get logged-in user info
// ==============================
router.get('/me', protect, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ user: null });
  }
  return res.json({ user: req.user });
});

// ==============================
// Logout
// ==============================
router.post('/logout', (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Error logging out' });
  }
});

// ==============================
// Check if logged-in user is admin
// ==============================
router.get('/is-admin', protect, (req, res) => {
  if (req.user && req.user.email === ADMIN_EMAIL) {
    return res.json({ isAdmin: true });
  } else {
    return res.json({ isAdmin: false });
  }
});

module.exports = router;
