

const mongoose = require('mongoose');

// Define schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [50, 'Username cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    // Google OAuth2 fields
    googleId: { type: String, unique: true, sparse: true },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },

    // Session / Remember me
    refreshTokens: [
      {
        token: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// =======================
// Instance Methods
// =======================

// Convert user to a safe object (hide sensitive info)
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.refreshTokens;
  delete obj.__v;
  return obj;
};

// Add refresh token
userSchema.methods.addRefreshToken = function (token) {
  this.refreshTokens.push({ token });
  return this.save();
};

// Remove refresh token
userSchema.methods.removeRefreshToken = function (token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  return this.save();
};

// Prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
