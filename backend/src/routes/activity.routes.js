const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activity.controller");
const authMiddleware = require("../middlewares/auth.middleware"); // FIXED: Added 's' to middleware

router.post(
  "/log",
  authMiddleware,
  activityController.createLog
);

router.get(
  "/logs",
  authMiddleware,
  activityController.getLogs
);

module.exports = router;