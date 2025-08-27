const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ================== GET USER BY ID ==================
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('❌ Error fetching user by ID:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ================== GET ALL USERS ==================
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('❌ Error fetching all users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
