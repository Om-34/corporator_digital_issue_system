const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

exports.logActivity = async ({
  officeId,
  userId,
  action,
  details,
}) => {
  await pool.query(
    `INSERT INTO activity_logs (
      id,
      office_id,
      user_id,
      action,
      details
    ) VALUES ($1,$2,$3,$4,$5)`,
    [
      uuidv4(),
      officeId,
      userId,
      action,
      details,
    ]
  );
};
