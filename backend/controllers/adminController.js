// controllers/adminController.js

const User = require("../models/User");
const Product = require("../models/product");
const Order = require("../models/Order");

// ===============================
// Admin Dashboard Controller
// ===============================
exports.getDashboard = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const productsCount = await Product.countDocuments();
    const ordersCount = await Order.countDocuments();

    res.status(200).json({
      message: "Admin dashboard data fetched successfully",
      stats: {
        totalUsers: usersCount,
        totalProducts: productsCount,
        totalOrders: ordersCount,
      },
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    res.status(500).json({ message: "Server error while fetching dashboard data" });
  }
};

// ===============================
// Manage Users
// ===============================
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // hide passwords
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error while fetching users" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error while deleting user" });
  }
};

// ===============================
// Manage Products
// ===============================
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error while fetching products" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    await Product.findByIdAndDelete(productId);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error while deleting product" });
  }
};

// ===============================
// Manage Orders
// ===============================
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user").populate("products.product");
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    await Order.findByIdAndDelete(orderId);
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Server error while deleting order" });
  }
};

// GET /api/admin/dashboard
exports.getDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        res.json({ totalUsers, totalProducts, totalOrders });
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        res.status(500).json({ error: true, message: 'Failed to fetch dashboard data' });
    }
};