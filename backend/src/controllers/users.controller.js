const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

// ============================
// CREATE LOCAL USER (ADMIN/SUPER_ADMIN ONLY)
// ============================
exports.createUser = async (req, res) => {
  // Added 'role' to req.body so Admin can choose between USER or OPERATOR
  const { name, phone, password, role } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ message: "Name, phone, and password required" });
  }

  try {
    const creatorRole = req.user.role;
    const creatorOfficeId = req.user.officeId;

    // 🛡️ SECURITY CHECK: Only Admin or Super Admin can create users
    if (creatorRole !== "ADMIN" && creatorRole !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Access denied: Unauthorized role" });
    }

    // 🛡️ ROLE PROTECTION: Standard Admins cannot create Admin or Super Admin accounts
    if (creatorRole === "ADMIN" && (role === "ADMIN" || role === "SUPER_ADMIN")) {
      return res.status(403).json({ 
        message: "Access denied: Admins can only create Operators or Users" 
      });
    }

    // 🛡️ SYSTEM PROTECTION: Nobody can create a Super Admin via the API
    if (role === "SUPER_ADMIN") {
      return res.status(403).json({ message: "Super Admin can only be created via Database" });
    }

    const userId = uuidv4();
    // Use creator's officeId to ensure isolation; Super Admin must provide an officeId in body if creating for someone else
    const officeId = req.body.officeId || creatorOfficeId;

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
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, officeId, name, phone, hashedPassword, role || 'USER']
    );

    res.status(201).json({
      message: `${role || 'User'} created successfully`,
    });
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// GET ALL USERS (OFFICE-WISE / GLOBAL)
// ============================
exports.getAllUsers = async (req, res) => {
  try {
    const { role, officeId } = req.user;

    let query;
    let queryParams = [];

    // ⚓ MULTI-TENANT LOGIC: 
    // Super Admin sees all users across the entire system
    // Admins only see users within their own office_id
    if (role === "SUPER_ADMIN") {
      query = `SELECT id, office_id, name, phone, role, is_active, created_at
               FROM users
               ORDER BY created_at DESC`;
    } else {
      query = `SELECT id, name, phone, role, is_active, created_at
               FROM users
               WHERE office_id = $1
               ORDER BY created_at DESC`;
      queryParams.push(officeId);
    }

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};