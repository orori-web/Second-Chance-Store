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
