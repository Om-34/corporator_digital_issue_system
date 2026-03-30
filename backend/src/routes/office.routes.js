const express = require("express");
const router = express.Router();
const officeController = require("../controllers/office.controller");
const authMiddleware = require("../middlewares/auth.middleware"); 

// ==========================================
// 🌍 MASTER ADMIN ROUTES
// ==========================================

// ✅ GET /api/office/all -> Loads the table for the Master Admin
router.get("/all", authMiddleware, officeController.getAllOffices);

// ✅ POST /api/office/create -> Saves a new ward office to the DB
router.post("/create", authMiddleware, officeController.createOffice);


// ==========================================
// 🏢 OFFICE-SPECIFIC ROUTES (Regular Admin)
// ==========================================

// GET /api/office/details -> Fetches current office name
router.get("/details", authMiddleware, officeController.getOfficeDetails);

// PATCH /api/office/update -> Renames the current office
router.patch("/update", authMiddleware, officeController.updateOffice);

module.exports = router;