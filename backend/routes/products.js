const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

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

    

   




    


    
   

// GET product details by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching product details' });
    }
});

// ✅ POST a new product with file upload
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
    const { name, description, category, price, sellerPhone } = req.body;
    const image = req.file ? req.file.filename : null;

    // Validate all required fields
    if (!name || !description || !category || !price || !image || !sellerPhone) {
        return res.status(400).json({ success: false, message: 'All fields required including phone number and image' });
    }

    try {
        const newProduct = new Product({
            name,
            description,
            category,
            price,
            image,
            sellerId: req.user.id, // link product to logged-in user
            sellerPhone
        });

        await newProduct.save();
        res.status(201).json({ success: true, message: 'Product posted successfully' });
    } catch (err) {
        console.error('Error posting product:', err);
        res.status(500).json({ success: false, message: 'Error posting product' });
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
