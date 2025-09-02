require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');

// Models
const User = require('./models/User');
const Product = require('./models/product');
const Message = require('./models/Message');
const Order = require('./models/Order');

// Routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/products'); 
const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes');
const popularProductsRoutes = require('./routes/popularProducts');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Env variables
const mongoURI = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;
const sessionSecret = process.env.SESSION_SECRET || 'fallbacksecret';

if (!mongoURI || !jwtSecret) {
  console.error('❌ Missing MONGODB_URI or JWT_SECRET in .env');
  process.exit(1);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

// Session
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Auth routes
app.use('/api/auth', authRoutes);

// MongoDB connection
mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/popular-products', popularProductsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index1.html'));
});

console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error FULL:", err);
  if (err && err.stack) console.error("Stack trace:", err.stack);

  res.status(500).json({
    error: true,
    message: err?.message || 'Unexpected error occurred',
    details: err, // helpful for debugging
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
