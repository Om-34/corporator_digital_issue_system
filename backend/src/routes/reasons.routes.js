const express = require("express");
const router = express.Router();

const reasonsController = require("../controllers/reasons.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Admin-only routes
router.post("/", authMiddleware, reasonsController.createReason);
router.get("/", authMiddleware, reasonsController.getAllReasons);
router.put("/:id", authMiddleware, reasonsController.updateReason);
router.patch("/:id/deactivate", authMiddleware, reasonsController.deactivateReason);

module.exports = router;
