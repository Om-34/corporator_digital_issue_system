const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

// ============================
// CREATE REASON
// ============================
exports.createReason = async (req, res) => {
  const { reasonName } = req.body;

  if (!reasonName) {
    return res.status(400).json({ message: "Reason name is required" });
  }

  try {
    // Only admin can create
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const id = uuidv4();

    await pool.query(
      `INSERT INTO reasons (id, reason_name)
       VALUES ($1, $2)`,
      [id, reasonName]
    );

    res.status(201).json({ message: "Reason created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// GET ALL REASONS
// ============================
exports.getAllReasons = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, reason_name, is_active
       FROM reasons
       ORDER BY reason_name`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// UPDATE REASON
// ============================
exports.updateReason = async (req, res) => {
  const { id } = req.params;
  const { reasonName } = req.body;

  if (!reasonName) {
    return res.status(400).json({ message: "Reason name is required" });
  }

  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await pool.query(
      `UPDATE reasons
       SET reason_name = $1
       WHERE id = $2`,
      [reasonName, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Reason not found" });
    }

    res.json({ message: "Reason updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// DEACTIVATE REASON (SOFT DELETE)
// ============================
exports.deactivateReason = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await pool.query(
      `UPDATE reasons
       SET is_active = false
       WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Reason not found" });
    }

    res.json({ message: "Reason deactivated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
