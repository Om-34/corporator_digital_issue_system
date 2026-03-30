const db = require("../config/db");

/* ====================================================
   ✅ HELPER: INTERNAL LOGGER (Used by other Controllers)
   ==================================================== */
exports.logActivity = async (userId, userName, action, details) => {
  try {
    if (!userId || !action) {
      console.warn("⚠️ Skipping log: Missing userId or action");
      return;
    }

    await db.query(
      `INSERT INTO activity_logs (user_id, user_name, action, details)
       VALUES ($1, $2, $3, $4)`,
      [userId, userName || "Unknown", action, details || ""]
    );
    
    console.log(`📝 [LOG] ${userName}: ${action}`);
  } catch (error) {
    console.error("⚠️ Failed to save log:", error.message);
  }
};

/* ====================================================
   API: CREATE ACTIVITY LOG (Manual trigger from Frontend)
   ==================================================== */
exports.createLog = async (req, res) => {
  try {
    const { action, details } = req.body;
    const user = req.user; 

    if (!action) {
      return res.status(400).json({ message: "Action required" });
    }

    await exports.logActivity(
      user.userId || user.id, 
      user.name, 
      action, 
      details
    );

    res.json({ message: "Activity logged successfully" });
  } catch (error) {
    console.error("Manual Log Error:", error);
    res.status(500).json({ message: "Failed to log activity" });
  }
};

/* ====================================================
   API: GET ACTIVITY LOGS (Isolated & Eagle Eye Logic)
   ==================================================== */
exports.getLogs = async (req, res) => {
  try {
    const { officeId, role } = req.user;
    let query;
    let queryParams = [];

    /**
     * 🦅 MASTER ADMIN (Eagle Eye):
     * Added ::uuid cast to solve type mismatch error.
     */
    if (role === 'SUPER_ADMIN') {
      query = `
        SELECT 
          a.*, 
          COALESCE(u.name, a.user_name) AS initiator_name, 
          o.office_name 
        FROM activity_logs a
        LEFT JOIN users u ON a.user_id::uuid = u.id
        LEFT JOIN corporator_offices o ON u.office_id = o.id
        ORDER BY a.created_at DESC`;
    } 

    /**
     * 🛡️ WARD ADMIN (Isolated):
     * Added ::uuid cast and office_id filter.
     */
    else if (role === 'ADMIN') {
      if (!officeId) {
        return res.status(400).json({ message: "Admin not assigned to any office" });
      }

      query = `
        SELECT 
          a.*, 
          COALESCE(u.name, a.user_name) AS initiator_name 
        FROM activity_logs a
        LEFT JOIN users u ON a.user_id::uuid = u.id
        WHERE u.office_id = $1
        ORDER BY a.created_at DESC`;
      queryParams.push(officeId);
    } 

    else {
      return res.status(403).json({ message: "Access Denied" });
    }

    const result = await db.query(query, queryParams);
    res.json(result.rows); 
  } catch (error) {
    console.error("Fetch Logs Error:", error);
    res.status(500).json({ message: "Failed to fetch activity logs" });
  }
};