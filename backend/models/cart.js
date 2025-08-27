const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // optional, if you have a Product model
            name: { type: String, required: true },
            price: { type: Number, required: true },
            image: { type: String },
            sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            sellerPhone: { type: String, required: true }
        }
    ]
});

module.exports = mongoose.model('Cart', cartSchema);
