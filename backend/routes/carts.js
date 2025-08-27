const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const jwt = require('jsonwebtoken');

// ===========================
// Middleware to authenticate JWT
// ===========================
const authenticateToken = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// ===========================
// GET /api/cart/:userId - Get user cart
// ===========================
router.get('/:userId', authenticateToken, async (req, res) => {
    if (req.user.id !== req.params.userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    try {
        let cart = await Cart.findOne({ userId: req.params.userId });
        if (!cart) cart = { items: [] };
        res.status(200).json(cart.items);
    } catch (err) {
        console.error("Error fetching cart:", err);
        res.status(500).json({ success: false, message: 'Error fetching cart' });
    }
});

// ===========================
// POST /api/cart/:userId - Add item(s)
// ===========================
router.post('/:userId', authenticateToken, async (req, res) => {
    if (req.user.id !== req.params.userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    try {
        const { item } = req.body;
        if (!item) return res.status(400).json({ success: false, message: 'Item is required' });

        let cart = await Cart.findOne({ userId: req.params.userId });
        if (!cart) {
            cart = new Cart({ userId: req.params.userId, items: [item] });
        } else {
            cart.items.push(item);
        }
        await cart.save();
        res.status(200).json({ success: true, items: cart.items });
    } catch (err) {
        console.error("Error adding to cart:", err);
        res.status(500).json({ success: false, message: 'Error adding to cart' });
    }
});

// ===========================
// POST /api/cart/:userId/remove - Remove one item
// ===========================
router.post('/:userId/remove', authenticateToken, async (req, res) => {
    if (req.user.id !== req.params.userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    try {
        const { productId } = req.body;
        let cart = await Cart.findOne({ userId: req.params.userId });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        cart.items = cart.items.filter(item => String(item._id) !== productId);
        await cart.save();
        res.status(200).json({ success: true, items: cart.items });
    } catch (err) {
        console.error("Error removing cart item:", err);
        res.status(500).json({ success: false, message: 'Error removing item' });
    }
});

// ===========================
// POST /api/cart/:userId/clear - Clear cart
// ===========================
router.post('/:userId/clear', authenticateToken, async (req, res) => {
    if (req.user.id !== req.params.userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    try {
        await Cart.findOneAndUpdate({ userId: req.params.userId }, { items: [] });
        res.status(200).json({ success: true, message: 'Cart cleared' });
    } catch (err) {
        console.error("Error clearing cart:", err);
        res.status(500).json({ success: false, message: 'Error clearing cart' });
    }
});

module.exports = router;
