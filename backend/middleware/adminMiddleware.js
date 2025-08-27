// middleware/adminMiddleware.js

// Hardcoded admin email (can be moved to env variable later if needed)
const ADMIN_EMAIL = "nyanchongiorori@gmail.com";

const adminMiddleware = (req, res, next) => {
  try {
    // Check if user is logged in
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: Please log in first." });
    }

    // Check if logged-in user is admin
    if (req.user.email !== ADMIN_EMAIL) {
      return res.status(403).json({ message: "Forbidden: You are not an admin." });
    }

    // If admin, allow access
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ message: "Server error in admin middleware." });
  }
};

module.exports = adminMiddleware;
