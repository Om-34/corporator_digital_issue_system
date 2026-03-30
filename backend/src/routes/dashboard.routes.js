const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboard.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// ==========================================
// 📊 GENERAL DASHBOARD ROUTES
// ==========================================

// Get overall counts (Total, New, Completed)
router.get("/summary", authMiddleware, dashboardController.getSummary);

// Get counts grouped by status (NEW, IN_PROCESS, etc.)
router.get("/status-wise", authMiddleware, dashboardController.getStatusWise);

// Get counts grouped by category (Water, Roads, etc.)
router.get("/category-wise", authMiddleware, dashboardController.getCategoryWise);

// Get 30-day trend data for charts
router.get("/last-30-days", authMiddleware, dashboardController.getLast30Days);


// ==========================================
// 🌍 MASTER ADMIN EXCLUSIVE ROUTES
// ==========================================

// ✅ NEW: Get all Ward Admins and their last_login timestamps
router.get("/admin-activity", authMiddleware, dashboardController.getAdminActivity);

// ✅ NEW: Get complaint counts grouped by Office/Ward
router.get("/office-stats", authMiddleware, dashboardController.getOfficeWiseStats);

module.exports = router;