const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// ==========================================
// 🔓 PUBLIC ROUTES (No Token Needed)
// ==========================================

// Get offices for the registration dropdown
router.get("/public/offices", authController.getPublicOffices);

// Register a new citizen
router.post("/register-citizen", authController.registerCitizen);

// User Login
router.post("/login", authController.login);


// ==========================================
// 🛡️ PROTECTED ROUTES (Token Required)
// ==========================================

/** * ✅ MASTER ADMIN ONLY
 * Route for onboarding new Corporator Offices
 */
router.post("/register-office", authMiddleware, authController.registerOfficeAndAdmin);

/** * ✅ ADMIN ONLY
 * Allows a Ward Admin to create operators for their specific ward
 */
router.post("/register-operator", authMiddleware, authController.registerOperator);


module.exports = router;