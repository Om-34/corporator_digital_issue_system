const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const { logActivity } = require("./activity.controller");

// ============================
// GET PUBLIC OFFICES
// ============================
exports.getPublicOffices = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, office_name FROM corporator_offices ORDER BY office_name ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch Offices Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// REGISTER CITIZEN
// ============================
exports.registerCitizen = async (req, res) => {
  const { name, phone, password, office_id } = req.body;
  if (!name || !phone || !password || !office_id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const userCheck = await pool.query("SELECT * FROM users WHERE phone = $1", [phone]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await pool.query(
      `INSERT INTO users (id, office_id, name, phone, password, role, is_active)
       VALUES ($1, $2, $3, $4, $5, 'USER', true)`,
      [userId, office_id, name, phone, hashedPassword]
    );

    await logActivity(userId, name, "REGISTRATION", "New citizen account created");
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// REGISTER OFFICE + ADMIN (MASTER ADMIN ONLY)
// =============================================
exports.registerOfficeAndAdmin = async (req, res) => {
  if (!req.user || req.user.role.toUpperCase() !== 'SUPER_ADMIN') {
    return res.status(403).json({ 
      message: "Access Denied: Only the Master Admin can create new offices." 
    });
  }

  const { officeName, adminName, phone, password } = req.body;
  if (!officeName || !adminName || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    let officeResult = await pool.query(
      "SELECT id FROM corporator_offices WHERE office_name = $1",
      [officeName]
    );

    let officeId = officeResult.rows.length > 0 ? officeResult.rows[0].id : uuidv4();
    if (officeResult.rows.length === 0) {
      await pool.query("INSERT INTO corporator_offices (id, office_name) VALUES ($1, $2)", [officeId, officeName]);
    }

    const userCheck = await pool.query("SELECT * FROM users WHERE phone = $1", [phone]);
    if (userCheck.rows.length > 0) return res.status(400).json({ message: "Phone number already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await pool.query(
      `INSERT INTO users (id, office_id, name, phone, password, role, is_active)
       VALUES ($1, $2, $3, $4, $5, 'ADMIN', true)`,
      [userId, officeId, adminName, phone, hashedPassword]
    );

    await logActivity(req.user.userId, req.user.name, "OFFICE_ONBOARDING", `Onboarded ${adminName} for ${officeName}`);
    res.status(201).json({ message: "Office and Admin registered successfully" });
  } catch (error) {
    console.error("Master Registration Error:", error);
    res.status(500).json({ message: "Server error during onboarding" });
  }
};

// =============================================
// REGISTER OPERATOR (ADMIN ONLY)
// =============================================
exports.registerOperator = async (req, res) => {
  const { name, phone, password } = req.body;
  const { officeId, userId: adminId, name: adminName } = req.user;

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: "Only Admins can create operators." });
  }

  try {
    const userCheck = await pool.query("SELECT * FROM users WHERE phone = $1", [phone]);
    if (userCheck.rows.length > 0) return res.status(400).json({ message: "Phone number registered." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const opId = uuidv4();

    await pool.query(
      `INSERT INTO users (id, office_id, name, phone, password, role, is_active)
       VALUES ($1, $2, $3, $4, $5, 'OPERATOR', true)`,
      [opId, officeId, name, phone, hashedPassword]
    );

    await logActivity(adminId, adminName, "OPERATOR_CREATED", `Created operator account: ${name}`);
    res.status(201).json({ message: "Operator created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// LOGIN (Updated with last_login)
// ============================
exports.login = async (req, res) => {
  const { phone, password } = req.body;
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

    // ✅ Track the login time in the database
    await pool.query(
      "UPDATE users SET last_login = NOW() WHERE id = $1",
      [user.id]
    );

    await logActivity(user.id, user.name, "LOGIN", "User logged in");

    const token = jwt.sign(
      { userId: user.id, officeId: user.office_id || null, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        officeId: user.office_id || null,
        phone: user.phone,
        last_login: new Date() // Sending back the current time for the UI
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};