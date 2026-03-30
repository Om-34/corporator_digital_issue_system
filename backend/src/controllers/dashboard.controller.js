const pool = require("../config/db");

// ==========================================
// 1. OVERALL SUMMARY
// ==========================================
exports.getSummary = async (req, res) => {
  try {
    const { officeId, userId, role } = req.user;
    let query;
    let queryParams = [];

    if (role === 'SUPER_ADMIN') {
      query = `SELECT 
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'NEW') AS new,
                COUNT(*) FILTER (WHERE status = 'IN_PROCESS') AS in_process,
                COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed
               FROM complaints`;
    } else if (role === 'USER') {
      query = `SELECT 
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'NEW') AS new,
                COUNT(*) FILTER (WHERE status = 'IN_PROCESS') AS in_process,
                COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed
               FROM complaints
               WHERE written_by_user_id = $1`;
      queryParams.push(userId);
    } else {
      query = `SELECT 
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'NEW') AS new,
                COUNT(*) FILTER (WHERE status = 'IN_PROCESS') AS in_process,
                COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed
               FROM complaints
               WHERE office_id = $1`;
      queryParams.push(officeId);
    }

    const result = await pool.query(query, queryParams);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("DASHBOARD SUMMARY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// 2. STATUS-WISE COUNT
// ==========================================
exports.getStatusWise = async (req, res) => {
  try {
    const { officeId, userId, role } = req.user;
    let query;
    let queryParams = [];

    if (role === 'SUPER_ADMIN') {
      query = `SELECT status, COUNT(*) AS count FROM complaints GROUP BY status`;
    } else if (role === 'USER') {
      query = `SELECT status, COUNT(*) AS count FROM complaints WHERE written_by_user_id = $1 GROUP BY status`;
      queryParams.push(userId);
    } else {
      query = `SELECT status, COUNT(*) AS count FROM complaints WHERE office_id = $1 GROUP BY status`;
      queryParams.push(officeId);
    }

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// 3. CATEGORY-WISE COUNT
// ==========================================
exports.getCategoryWise = async (req, res) => {
  try {
    const { officeId, userId, role } = req.user;
    let query;
    let queryParams = [];

    if (role === 'SUPER_ADMIN') {
      query = `SELECT r.reason_name AS category, COUNT(c.id) AS count
               FROM reasons r
               LEFT JOIN complaints c ON r.id = c.reason_id
               GROUP BY r.reason_name ORDER BY count DESC`;
    } else if (role === 'USER') {
      query = `SELECT r.reason_name AS category, COUNT(c.id) AS count
               FROM reasons r
               LEFT JOIN complaints c ON r.id = c.reason_id
               WHERE c.written_by_user_id = $1
               GROUP BY r.reason_name ORDER BY count DESC`;
      queryParams.push(userId);
    } else {
      query = `SELECT r.reason_name AS category, COUNT(c.id) AS count
               FROM reasons r
               LEFT JOIN complaints c ON r.id = c.reason_id
               WHERE r.office_id = $1
               GROUP BY r.reason_name ORDER BY count DESC`;
      queryParams.push(officeId);
    }

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// 4. ✅ FIXED: LAST 30 DAYS (Missing Function)
// ==========================================
exports.getLast30Days = async (req, res) => {
  try {
    const { officeId, userId, role } = req.user;
    let query;
    let queryParams = [];

    if (role === 'SUPER_ADMIN') {
      query = `SELECT DATE(complaint_date) AS date, COUNT(*) AS count
               FROM complaints
               WHERE complaint_date >= CURRENT_DATE - INTERVAL '30 days'
               GROUP BY DATE(complaint_date)
               ORDER BY DATE(complaint_date)`;
    } else if (role === 'USER') {
      query = `SELECT DATE(complaint_date) AS date, COUNT(*) AS count
               FROM complaints
               WHERE written_by_user_id = $1
                 AND complaint_date >= CURRENT_DATE - INTERVAL '30 days'
               GROUP BY DATE(complaint_date)
               ORDER BY DATE(complaint_date)`;
      queryParams.push(userId);
    } else {
      query = `SELECT DATE(complaint_date) AS date, COUNT(*) AS count
               FROM complaints
               WHERE office_id = $1
                 AND complaint_date >= CURRENT_DATE - INTERVAL '30 days'
               GROUP BY DATE(complaint_date)
               ORDER BY DATE(complaint_date)`;
      queryParams.push(officeId);
    }

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("DASHBOARD TREND ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// 5. ADMIN ACTIVITY (MASTER ONLY)
// ==========================================
exports.getAdminActivity = async (req, res) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: "Access Denied" });
    }

    const query = `
      SELECT u.name, u.phone, u.last_login, o.office_name, u.is_active
      FROM users u
      JOIN corporator_offices o ON u.office_id = o.id
      WHERE u.role = 'ADMIN'
      ORDER BY u.last_login DESC NULLS LAST`;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// 6. OFFICE-WISE DISTRIBUTION (MASTER ONLY)
// ==========================================
exports.getOfficeWiseStats = async (req, res) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: "Access Denied" });
    }

    const query = `
      SELECT o.office_name, COUNT(c.id) AS count
      FROM corporator_offices o
      LEFT JOIN complaints c ON o.id = c.office_id
      GROUP BY o.office_name
      ORDER BY count DESC`;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};