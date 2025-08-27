// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// ✅ Admin Dashboard
router.get("/dashboard", adminController.getDashboard);

// ✅ Manage Users
router.get("/users", adminController.getUsers);
router.delete("/users/:id", adminController.deleteUser);

// ✅ Manage Products
router.get("/products", adminController.getProducts);
router.delete("/products/:id", adminController.deleteProduct);

// ✅ Manage Orders
router.get("/orders", adminController.getOrders);
router.delete("/orders/:id", adminController.deleteOrder);

module.exports = router;
