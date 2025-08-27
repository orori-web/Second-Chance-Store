const express = require('express');
const router = express.Router();
const SearchHistory = require('../models/searchHistory'); // Adjust path if necessary
const Product = require('../models/product'); // Assuming products are stored here
const { protect } = require('../middleware/authMiddleware');

// Function to get popular products based on search count or recent ones
const getPopularProducts = async () => {
    const popularProducts = await SearchHistory.find()
        .sort({ searchCount: -1 })
        .limit(5) // Fetch top 5 popular products
        .populate('productId'); // Populate the product details

    if (popularProducts.length > 0) {
        return popularProducts.map(item => item.productId); // Return the product details
    } else {
        // If no popular products, return recent ones based on the added date
        return await Product.find().sort({ createdAt: -1 }).limit(5);
    }
};

// Route to serve the popular products for the homepage
router.get('/api/popular-products', async (req, res) => {
    try {
        const products = await getPopularProducts();
        res.json(products); // Send the popular/recent products to the frontend
    } catch (error) {
        console.error('Error fetching popular products:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Only logged-in users can create products
router.post('/', protect, async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      user: req.user._id, // attach logged-in user
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Public route: anyone can view products
router.get('/', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});




module.exports = router;
