const User = require('./models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Generate Auth Token (for login sessions)
const generateAuthToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// REGISTER USER
exports.signupUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send verification email
    const verificationLink = `${process.env.CLIENT_URL}/verify/${verificationToken}`;
    await sendEmail(
      user.email,
      'Verify Your Email',
      `Click here to verify your account: ${verificationLink}`
    );

    res.status(201).json({ message: 'User registered. Please check your email to verify.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Signup failed' });
  }
};

// VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with this token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    // Verify user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Verification failed' });
  }
};

// RESEND VERIFICATION EMAIL
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

    // New token
    const newToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = newToken;
    user.verificationTokenExpires = Date.now() + 3600000;
    await user.save();

    const verificationLink = `${process.env.CLIENT_URL}/verify/${newToken}`;
    await sendEmail(
      user.email,
      'Verify Your Email (Resent)',
      `Click here to verify your account: ${verificationLink}`
    );

    res.json({ message: 'Verification email resent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Resend failed' });
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Check if verified
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email before logging in' });
    }

    // Generate token
    const token = generateAuthToken(user);

    // Send token in HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
};

// LOGOUT ✅
exports.logoutUser = async (req, res) => {
  try {
    // Destroy passport session (if exists)
    req.logout(() => {
      // do nothing
    });
    req.session?.destroy(() => {});

    // Clear JWT cookie
    res.clearCookie("token");

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
};
