const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

// ============================
// CREATE LOCAL USER (ADMIN ONLY)
// ============================
exports.createUser = async (req, res) => {
  const { name, phone, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ message: "Name and password required" });
  }

  try {
    // Only admin can create users
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const userId = uuidv4();
    const officeId = req.user.officeId;

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (
        id,
        office_id,
        name,
        phone,
        password,
        role
      )
      VALUES ($1, $2, $3, $4, $5, 'USER')`,
      [userId, officeId, name, phone, hashedPassword]
    );

    res.status(201).json({
      message: "Local user created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// GET ALL USERS (OFFICE-WISE)
// ============================
exports.getAllUsers = async (req, res) => {
  try {
    const officeId = req.user.officeId;

    const result = await pool.query(
      `SELECT id, name, phone, role, is_active, created_at
       FROM users
       WHERE office_id = $1
       ORDER BY created_at DESC`,
      [officeId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
