const pool = require("../config/db");

const generateIssueNumber = async (officeId) => {
  // Count total complaints for this office
  const result = await pool.query(
    `SELECT COUNT(*) FROM complaints WHERE office_id = $1`,
    [officeId]
  );

  const count = parseInt(result.rows[0].count, 10) + 1;

  const year = new Date().getFullYear();

  // Format: OFFICE-2026-0001
  const issueNo = `OFF-${year}-${String(count).padStart(4, "0")}`;

  return issueNo;
};

module.exports = generateIssueNumber;
