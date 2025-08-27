const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
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

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// JWT middleware (cookie-based)
//const authenticateToken = (req, res, next) => {
//  const token = req.cookies?.token;
//  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized: No token' });

 // jwt.verify(token, jwtSecret, (err, user) => {
  //  if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
  //  req.user = user;
   // next();
  //});
//};

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/popular-products', popularProductsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);


// Serve frontend & uploads
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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