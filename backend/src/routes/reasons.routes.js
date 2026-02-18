const express = require("express");
const router = express.Router();

const reasonsController = require("../controllers/reasons.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Admin-only routes
router.post("/", authMiddleware, reasonsController.createReason);
router.get("/", authMiddleware, reasonsController.getAllReasons);
router.put("/:id", authMiddleware, reasonsController.updateReason);

// Status Toggle Routes
router.patch("/:id/deactivate", authMiddleware, reasonsController.deactivateReason);
router.patch("/:id/activate", authMiddleware, reasonsController.activateReason); // ✅ Added Activate Route

module.exports = router;