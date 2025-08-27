const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
        {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            image: { type: String },
            sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            sellerPhone: { type: String, required: true }
        }
    ],
    totalPrice: { type: Number, required: true },
    status: { type: String, default: 'Pending' }, // Order status (Pending, Completed, etc.)
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
