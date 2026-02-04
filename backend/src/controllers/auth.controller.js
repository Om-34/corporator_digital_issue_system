const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

// ============================
// REGISTER OFFICE + ADMIN
// ============================
exports.registerOfficeAndAdmin = async (req, res) => {
  const { officeName, adminName, phone, password } = req.body;

  if (!officeName || !adminName || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // 1. Create office
    const officeId = uuidv4();

    await pool.query(
      `INSERT INTO corporator_offices (id, office_name)
       VALUES ($1, $2)`,
      [officeId, officeName]
    );

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create admin user
    const userId = uuidv4();

    await pool.query(
      `INSERT INTO users 
      (id, office_id, name, phone, password, role)
      VALUES ($1, $2, $3, $4, $5, 'ADMIN')`,
      [userId, officeId, adminName, phone, hashedPassword]
    );

    return res.status(201).json({
      message: "Office and Admin registered successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ============================
// LOGIN
// ============================
exports.login = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: "Phone and password required" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE phone = $1 AND is_active = true`,
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        officeId: user.office_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        officeId: user.office_id,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
