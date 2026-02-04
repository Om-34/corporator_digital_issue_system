const pool = require("../config/db");

// ============================
// OVERALL SUMMARY
// ============================
exports.getSummary = async (req, res) => {
  try {
    const officeId = req.user.officeId;

    const result = await pool.query(
      `SELECT 
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'NEW') AS new,
        COUNT(*) FILTER (WHERE status = 'IN_PROCESS') AS in_process,
        COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed
       FROM complaints
       WHERE office_id = $1`,
      [officeId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// STATUS-WISE COUNT
// ============================
exports.getStatusWise = async (req, res) => {
  try {
    const officeId = req.user.officeId;

    const result = await pool.query(
      `SELECT status, COUNT(*) AS count
       FROM complaints
       WHERE office_id = $1
       GROUP BY status`,
      [officeId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// CATEGORY-WISE COUNT
// ============================
exports.getCategoryWise = async (req, res) => {
  try {
    const officeId = req.user.officeId;

    const result = await pool.query(
      `SELECT 
        r.reason_name AS category,
        COUNT(c.id) AS count
       FROM complaints c
       LEFT JOIN reasons r ON c.reason_id = r.id
       WHERE c.office_id = $1
       GROUP BY r.reason_name
       ORDER BY count DESC`,
      [officeId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// LAST 30 DAYS (DAY-WISE)
// ============================
exports.getLast30Days = async (req, res) => {
  try {
    const officeId = req.user.officeId;

    const result = await pool.query(
      `SELECT 
        DATE(complaint_date) AS date,
        COUNT(*) AS count
       FROM complaints
       WHERE office_id = $1
         AND complaint_date >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY DATE(complaint_date)
       ORDER BY DATE(complaint_date)`,
      [officeId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
