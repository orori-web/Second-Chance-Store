const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ===========================
// Middleware to authenticate JWT
// ===========================
const authenticateToken = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// ======================================================
// POST /api/orders/create - Place a new order (protected)
// ======================================================
router.post('/create', authenticateToken, async (req, res) => {
    console.log("POST /api/orders/create hit, req.body:", req.body);

    try {
        const { products, totalPrice } = req.body;

        if (!products || !Array.isArray(products) || products.length === 0 || !totalPrice) {
            return res.status(400).json({ success: false, message: 'Products and total price are required' });
        }

        // ✅ Validate each product has seller info
        const sanitizedProducts = products.map(product => {
            if (!product.sellerId || !product.sellerPhone) {
                throw new Error(`Product "${product.name}" is missing seller information`);
            }
            return {
                name: product.name,
                price: product.price,
                image: product.image,
                sellerId: product.sellerId,
                sellerPhone: product.sellerPhone
            };
        });

        const newOrder = new Order({
            buyerId: req.user.id,
            products: sanitizedProducts,
            totalPrice,
            status: 'Pending'
        });

        await newOrder.save();

        // ✅ No more email — frontend handles WhatsApp notifications
        res.status(201).json({ success: true, message: 'Order placed successfully!', order: newOrder });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: error.message || 'Error placing order' });
    }
});

// ======================================================
// GET /api/orders/myorders - Retrieve orders for logged-in user
// ======================================================
router.get('/myorders', authenticateToken, async (req, res) => {
    try {
        const buyerId = req.user.id;
        const orders = await Order.find({ buyerId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Error fetching orders' });
    }
});

module.exports = router;
