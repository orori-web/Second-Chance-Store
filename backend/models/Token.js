// backend/models/Token.js
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    token: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["emailVerify", "resetPassword"], // ✅ for multiple token purposes
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

const Token = mongoose.model("Token", tokenSchema);
module.exports = Token;
