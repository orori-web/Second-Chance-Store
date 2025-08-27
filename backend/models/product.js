const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: 'default-image.jpg' }, 
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerPhone: { type: String, required: true }, // ✅ New field for phone number
    createdAt: { type: Date, default: Date.now },
});

productSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
