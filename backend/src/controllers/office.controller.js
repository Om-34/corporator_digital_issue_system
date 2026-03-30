const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid"); // ✅ Added for creating new office IDs
const { logActivity } = require("./activity.controller");

// ============================
// ✅ NEW: GET ALL OFFICES (For Master Admin)
// ============================
exports.getAllOffices = async (req, res) => {
  try {
    // 🛡️ Security: Only Master Admin can see the full list
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: "Access Denied: Master Admin only" });
    }

    const result = await pool.query(
      "SELECT id, office_name, created_at FROM corporator_offices ORDER BY office_name ASC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Fetch All Offices Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// ✅ NEW: CREATE NEW OFFICE (For Master Admin)
// ============================
exports.createOffice = async (req, res) => {
  const { officeName } = req.body;
  const { userId, name: userName } = req.user;

  if (!officeName) {
    return res.status(400).json({ message: "Office name is required" });
  }

  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: "Access Denied" });
    }

    const newOfficeId = uuidv4();

    await pool.query(
      "INSERT INTO corporator_offices (id, office_name) VALUES ($1, $2)",
      [newOfficeId, officeName]
    );

    // ✅ Log the creation
    await logActivity(userId, userName, "OFFICE_CREATED", `Created new office: ${officeName}`);

    res.status(201).json({ message: "Office created successfully", id: newOfficeId });
  } catch (error) {
    console.error("Create Office Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// GET CURRENT OFFICE DETAILS (Existing Logic)
// ============================
exports.getOfficeDetails = async (req, res) => {
  try {
    const { officeId } = req.user;

    // Guard against Master Admin trying to access a specific office context
    if (!officeId && req.user.role !== 'SUPER_ADMIN') {
        return res.status(400).json({ message: "No office assigned to this user" });
    }

    const result = await pool.query(
      "SELECT id, office_name, created_at FROM corporator_offices WHERE id = $1",
      [officeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Office not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// UPDATE OFFICE NAME (Existing Logic)
// ============================
exports.updateOffice = async (req, res) => {
  const { officeName } = req.body;
  const { officeId, userId, name } = req.user;

  if (!officeName) {
    return res.status(400).json({ message: "Office name is required" });
  }

  try {
    const result = await pool.query(
      "UPDATE corporator_offices SET office_name = $1 WHERE id = $2",
      [officeName, officeId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Update failed: Office not found" });
    }

    await logActivity(userId, name, "OFFICE_UPDATE", `Renamed office to: ${officeName}`);

    res.json({ message: "Office settings updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};