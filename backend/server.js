const express = require('express');
const mongoose = require('mongoose');
// const multer = require('multer'); // ❌ No longer needed for local uploads
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport'); 
require('dotenv').config();

// Models
const User = require('./models/User');
const Product = require('./models/product');
const Message = require('./models/Message');
const Order = require('./models/Order');

// Routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/products'); // ✅ now uses Cloudinary in products.js
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
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// Session
app.use(session({
  secret: 'supersecretkey',
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

// ❌ Removed local multer storage setup — now handled in products.js with Cloudinary

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/popular-products', popularProductsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ❌ Removed `/uploads` serving because images are now on Cloudinary

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index1.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({ error: true, message: 'Unexpected error occurred' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
