const pool = require("../config/db");

const generateIssueNumber = async (officeId) => {
  const year = new Date().getFullYear();
  
  // 1. Get a short unique prefix from the Office UUID (first 4 characters)
  // Example: '550e' from '550e8400-e29b...'
  const officePrefix = officeId.substring(0, 4).toUpperCase();

  // 2. Look for the highest issue number for THIS office and THIS year
  // Pattern: '550E-2026-%'
  const result = await pool.query(
    `SELECT issue_no FROM complaints 
     WHERE office_id = $1 AND issue_no LIKE $2
     ORDER BY issue_no DESC LIMIT 1`,
    [officeId, `${officePrefix}-${year}-%`]
  );

  let nextNumber = 1;

  if (result.rows.length > 0) {
    const lastIssueNo = result.rows[0].issue_no;
    // Split '550E-2026-0005' to get '0005'
    const parts = lastIssueNo.split("-");
    const lastSequence = parts[parts.length - 1]; 
    nextNumber = parseInt(lastSequence, 10) + 1;
  }

  // 3. New Format: [OFFICE_PREFIX]-[YEAR]-[SEQUENCE]
  // Result example: 550E-2026-0001
  const issueNo = `${officePrefix}-${year}-${String(nextNumber).padStart(4, "0")}`;

  return issueNo;
};

module.exports = generateIssueNumber;