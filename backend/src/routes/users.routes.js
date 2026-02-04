const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Admin-only
router.post("/", authMiddleware, usersController.createUser);
router.get("/", authMiddleware, usersController.getAllUsers);

module.exports = router;
