


require('dotenv').config();
const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const { CloudinaryStorage } = require('multer-storage-cloudinary');



// ✅ Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Multer setup for Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'second-chance-products', // optional folder name in Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png'],
    },
});
const upload = multer({ storage });

// ✅ Middleware to verify Google OAuth JWT token from cookie
const authenticateToken = (req, res, next) => {
    const token = req.cookies?.token; 
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
        req.user = user; 
        next();
    });
};

// GET all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


// ✅ GET homepage sections (each section wrapped separately)
router.get('/homepage', async (req, res) => {
  try {
    

    // Added Recently
    let addedRecently = [];
    try {
      console.log("Fetching recently added products...");
      addedRecently = await Product.find()
        .sort({ createdAt: -1 })
        
      console.log("Found recently added:", addedRecently.length);
    } catch (err) {
      console.error("Error fetching recently added products:", err);
    }

    // Phone Deals
    let phoneDeals = [];
    try {
      console.log("Fetching phone deals...");
      phoneDeals = await Product.find({ category: "Phones" })
        .sort({ createdAt: -1 })
        
      console.log("Found phone deals:", phoneDeals.length);
    } catch (err) {
      console.error("Error fetching phone deals:", err);
    }

    // TV Deals
    let tvDeals = [];
    try {
      console.log("Fetching TV deals...");
      tvDeals = await Product.find({ category: "TVs" })
        .sort({ createdAt: -1 })
        
      console.log("Found TV deals:", tvDeals.length);
    } catch (err) {
      console.error("Error fetching TV deals:", err);
    }

    // Electronics Deals
    let electronicsDeals = [];
    try {
      console.log("Fetching electronics deals...");
      electronicsDeals = await Product.find({ category: "Electronics" })
        .sort({ createdAt: -1 })
        
      console.log("Found electronics deals:", electronicsDeals.length);
    } catch (err) {
      console.error("Error fetching electronics deals:", err);
    }

    // Fashion Deals
    let fashionDeals = [];
    try {
      console.log("Fetching fashion deals...");
      fashionDeals = await Product.find({ category: "Fashion" })
        .sort({ createdAt: -1 })
        
      console.log("Found fashion deals:", fashionDeals.length);
    } catch (err) {
      console.error("Error fetching fashion deals:", err);
    }



    // Furnitures Deals
    let furnitureDeals = [];
    try {
      console.log("Fetching furniture deals...");
      furnitureDeals = await Product.find({ category: "Furnitures" })
        .sort({ createdAt: -1 });
      console.log("Found furniture deals:", furnitureDeals.length);
    } catch (err) {
      console.error("Error fetching furniture deals:", err);
    }

    // Home-Comforts Deals
    let homeComfortsDeals = [];
    try {
      console.log("Fetching home comforts deals...");
      homeComfortsDeals = await Product.find({ category: "Home-Comforts" })
        .sort({ createdAt: -1 });
      console.log("Found home comforts deals:", homeComfortsDeals.length);
    } catch (err) {
      console.error("Error fetching home comforts deals:", err);
    }

    // Kitchen Deals
    let kitchenDeals = [];
    try {
      console.log("Fetching kitchen deals...");
      kitchenDeals = await Product.find({ category: "Kitchen" })
        .sort({ createdAt: -1 });
      console.log("Found kitchen deals:", kitchenDeals.length);
    } catch (err) {
      console.error("Error fetching kitchen deals:", err);
    }

    // Transport Deals
    let transportDeals = [];
    try {
      console.log("Fetching transport deals...");
      transportDeals = await Product.find({ category: "Transport" })
        .sort({ createdAt: -1 });
      console.log("Found transport deals:", transportDeals.length);
    } catch (err) {
      console.error("Error fetching transport deals:", err);
    }

    // Personal-Care Deals
    let personalCareDeals = [];
    try {
      console.log("Fetching personal care deals...");
      personalCareDeals = await Product.find({ category: "Personal-Care" })
        .sort({ createdAt: -1 });
      console.log("Found personal care deals:", personalCareDeals.length);
    } catch (err) {
      console.error("Error fetching personal care deals:", err);
    }

    // Send all sections in one response
    res.json({
      addedRecently,
      phoneDeals,
      tvDeals,
      electronicsDeals,
      fashionDeals,
      furnitureDeals,
      homeComfortsDeals,
      kitchenDeals,
      transportDeals,
      personalCareDeals
    });

  } catch (err) {
    console.error("Error loading homepage:", err);
    res.status(500).json({ message: "Server error loading homepage", error: err.message });
  }
});

    

 // CREATE a new product
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  console.log('--- New POST /api/products request received ---');

  try {
    // 🔎 Step 1: Authentication check
    console.log('🟢 Step 1: Authentication check');
    console.log('Req.user:', req.user);

    if (!req.user) {
      console.error('❌ No req.user found');
      return res.status(401).json({ success: false, message: 'Unauthorized: No user data' });
    }

    // 🔎 Step 2: Debug request body
    console.log('🟢 Step 2: Checking req.body');
    console.log('Req.body:', req.body);

    // 🔎 Step 3: Debug file upload
    console.log('🟢 Step 3: Checking req.file');
    console.log('Req.file:', req.file);

    const { name, description, category, price, sellerPhone } = req.body;

    if (!name || !description || !category || !price || !sellerPhone) {
      console.error('❌ Missing required fields:', { name, description, category, price, sellerPhone });
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!req.file) {
      console.error('❌ No image file uploaded');
      return res.status(400).json({ success: false, message: 'Product image is required' });
    }

    // 🔎 Step 4: Validate price
    const priceNumber = Number(price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid price' });
    }

    // ✅ Save product to MongoDB
    const newProduct = new Product({
      name,
      description,
      category,
      price: priceNumber,
      sellerPhone,
      image: req.file?.path || "default-image.jpg", // ✅ schema field = image
      sellerId: req.user.id, 
    });

    await newProduct.save();

    console.log('✅ Product saved:', newProduct);

    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    console.error('❌ Server error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});


// DELETE a product by ID
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ message: 'Error deleting product' });
    }
});





module.exports = router;
