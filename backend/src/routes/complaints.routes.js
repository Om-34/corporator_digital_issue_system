const express = require("express");
const router = express.Router();

const complaintsController = require("../controllers/complaints.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Create complaint
router.post("/", authMiddleware, complaintsController.createComplaint);

// Get all complaints
router.get("/", authMiddleware, complaintsController.getAllComplaints);

// Update complaint status
router.patch(
  "/:id/status",
  authMiddleware,
  complaintsController.updateComplaintStatus
);

// Get status history of complaint
router.get(
  "/:id/status-history",
  authMiddleware,
  complaintsController.getStatusHistory
);

module.exports = router;
