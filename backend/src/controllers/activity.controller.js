const db = require("../config/db");

/* ====================================================
   ✅ HELPER: INTERNAL LOGGER (Used by other Controllers)
   ==================================================== */
exports.logActivity = async (userId, userName, action, details) => {
  try {
    // Ensure we have values to prevent SQL errors
    if (!userId || !action) {
      console.warn("⚠️ Skipping log: Missing userId or action");
      return;
    }

    await db.query(
      `INSERT INTO activity_logs (user_id, user_name, action, details)
       VALUES ($1, $2, $3, $4)`,
      [userId, userName || "Unknown", action, details || ""]
    );
    console.log(`📝 LOG SAVED: ${action}`);
  } catch (error) {
    console.error("⚠️ Failed to save log:", error.message);
  }
};

/* =========================
   API: CREATE ACTIVITY LOG (Manual)
   ========================= */
exports.createLog = async (req, res) => {
  try {
    const { action, details } = req.body;
    const user = req.user; // coming from auth middleware

    if (!action) {
      return res.status(400).json({ message: "Action required" });
    }

    // Use the helper function defined above
    await exports.logActivity(
      user.id || user.userId, 
      user.name || user.username, 
      action, 
      details
    );

    res.json({ message: "Activity logged" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to log activity" });
  }
};

/* =========================
   API: GET ACTIVITY LOGS (ADMIN)
   ========================= */
exports.getLogs = async (req, res) => {
  try {
    // Check if role is ADMIN
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await db.query(
      `SELECT * FROM activity_logs ORDER BY created_at DESC`
    );

    res.json(result.rows); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
};