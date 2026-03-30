const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activity.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// ==========================================
// 📝 ACTIVITY LOGGING ROUTES
// ==========================================

/**
 * ✅ POST: Create an Activity Log
 * Access: Authenticated Users (Citizen, Admin, Master)
 * Purpose: Manually trigger a log entry from the frontend.
 */
router.post(
  "/log",
  authMiddleware,
  activityController.createLog
);

/**
 * ✅ GET: Fetch Activity Logs
 * Access: ADMIN or SUPER_ADMIN (Isolated by Controller)
 * Purpose: 
 * - Ward Admins: See logs for their specific ward only.
 * - Master Admin: "Eagle Eye" view of the entire system.
 */
router.get(
  "/logs",
  authMiddleware,
  activityController.getLogs
);

module.exports = router;