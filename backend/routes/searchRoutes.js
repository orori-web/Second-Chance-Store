const express = require('express');
const router = express.Router();
const Product = require('../models/product');

const handleSearch = async (req, res) => {
    const query = req.query.q;
  
    // Find products based on the search query
    const products = await Product.find({ name: { $regex: query, $options: 'i' } });
  
    // Track the search history
    products.forEach(async (product) => {
      let searchHistory = await SearchHistory.findOne({ productId: product._id });
      
      if (searchHistory) {
        searchHistory.searchCount += 1; // Increment search count
        searchHistory.lastSearched = Date.now(); // Update the search time
        await searchHistory.save();
      } else {
        searchHistory = new SearchHistory({ productId: product._id });
        await searchHistory.save();
      }
    });
  
    res.json(products); // Send the products as a response
  };
// Search endpoint
router.get('/', async (req, res) => {
    const { q, category, priceMin, priceMax, sort, page = 1, limit = 20 } = req.query;

    // Define the search query
    let searchQuery = {};
    if (q) {
        searchQuery.$text = { $search: q }; // MongoDB full-text search
    }
    if (category) {
        searchQuery.category = category;
    }
    if (priceMin || priceMax) {
        searchQuery.price = {};
        if (priceMin) searchQuery.price.$gte = Number(priceMin);
        if (priceMax) searchQuery.price.$lte = Number(priceMax);
    }

    try {
        const sortOption = {};
        if (sort === 'alphabetical') {
            sortOption.name = 1; // Sort by name (ascending)
        }
        sortOption.dateAdded = -1; // Secondary sort by recently added (descending)

        const products = await Product.find(searchQuery)
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const totalProducts = await Product.countDocuments(searchQuery);

        res.json({
            products,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        console.error('Error fetching search results:', error);
        res.status(500).json({ message: 'Error fetching search results' });
    }
});

router.get('/suggestions', async (req, res) => {
    const { q } = req.query;  // Get the query from the request
    
    if (!q) {
        return res.json([]);  // If there's no query, return empty suggestions
    }

    try {
        // Search for products based on name, description, or category
        const products = await Product.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },  // Case-insensitive search for product name
                { description: { $regex: q, $options: 'i' } },  // Case-insensitive search for description
                { category: { $regex: q, $options: 'i' } }   // Case-insensitive search for category
            ]
        }).limit(5);  // Limit the results to 5 suggestions

        // Return the products as suggestions
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching search suggestions' });
    }
});





module.exports = router;
