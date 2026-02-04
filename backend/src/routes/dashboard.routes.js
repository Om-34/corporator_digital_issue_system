const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboard.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/summary", authMiddleware, dashboardController.getSummary);
router.get("/status-wise", authMiddleware, dashboardController.getStatusWise);
router.get("/category-wise", authMiddleware, dashboardController.getCategoryWise);
router.get("/last-30-days", authMiddleware, dashboardController.getLast30Days);

module.exports = router;
