const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const controller = require("../controllers/complaintDocument.controller");

// Upload document for a complaint
router.post(
  "/:complaintId",
  auth,
  upload.single("document"), // 🔴 THIS NAME IS CRITICAL
  controller.uploadDocument
);

// Get documents for a complaint
router.get(
  "/:complaintId",
  auth,
  controller.getDocumentsByComplaint
);

module.exports = router;
