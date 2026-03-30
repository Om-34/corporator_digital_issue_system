const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const generateIssueNumber = require("../utils/issueNumberGenerator");
// ✅ ADDED: Import Helper
const { logActivity } = require("./activity.controller");

// ============================
// CREATE COMPLAINT
// ============================
exports.createComplaint = async (req, res) => {
  const {
    personName,
    contact,
    address,
    gender,
    reasonId,
    description,
    ward_no,
    area,
  } = req.body;

  if (!reasonId || !description) {
    return res.status(400).json({
      message: "Reason and description are required",
    });
  }

  try {
    const complaintId = uuidv4();
    const officeId = req.user.officeId;
    const writtenByUserId = req.user.userId;

    // Generate unique issue number (UNCHANGED)
    const issueNo = await generateIssueNumber(officeId);

    await pool.query(
      `INSERT INTO complaints (
        id,
        office_id,
        issue_no,
        complaint_date,
        person_name,
        contact,
        address,
        gender,
        reason_id,
        description,
        ward_no,
        area,
        written_by_user_id,
        status
      )
      VALUES (
        $1, $2, $3, CURRENT_DATE, $4, $5, $6, $7, $8::uuid, $9, $10, $11, $12, 'NEW'
      )`,
      [
        complaintId,
        officeId,
        issueNo,
        personName,
        contact,
        address,
        gender,
        reasonId, // This is the UUID from frontend
        description,
        ward_no || null,
        area || null,
        writtenByUserId,
      ]
    );

    // ✅ REAL-TIME ALERT: Notify Operators/Admins in this office
    const io = req.app.get("io");
    if (io) {
      io.to(officeId).emit("new_complaint_alert", {
        issueNo,
        personName,
        area: area || "General",
        id: complaintId
      });
    }

    // ✅ FIXED: Fetch actual user name instead of hardcoded "Staff"
    const userRes = await pool.query(`SELECT name FROM users WHERE id = $1`, [writtenByUserId]);
    const userName = userRes.rows[0]?.name || "Staff";

    await logActivity(writtenByUserId, userName, "NEW COMPLAINT", `Created complaint: ${issueNo}`);

    res.status(201).json({
      message: "Complaint registered successfully",
      issueNo,
      id: complaintId, // 👈 THIS WAS MISSING! NOW FRONTEND CAN UPLOAD.
    });
  } catch (error) {
    console.error("CREATE COMPLAINT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// GET ALL COMPLAINTS (OFFICE-WISE + ROLE ISOLATION)
// =============================================
exports.getAllComplaints = async (req, res) => {
  try {
    const { officeId, userId, role } = req.user;
    
    let query;
    let queryParams = [];

    // ⚓ DATA ISOLATION LOGIC
    if (role === 'USER') {
      // 🛡️ CITIZENS: Only see complaints YOU created
      query = `SELECT 
        c.id,
        c.issue_no,
        c.complaint_date,
        c.person_name,
        c.contact,
        c.address,
        c.gender,
        c.description,
        c.status,
        c.ward_no,
        c.area,
        r.reason_name,
        u.name AS written_by
       FROM complaints c
       LEFT JOIN reasons r ON c.reason_id = r.id
       LEFT JOIN users u ON c.written_by_user_id = u.id
       WHERE c.written_by_user_id = $1
       ORDER BY c.complaint_date DESC`;
      queryParams.push(userId);
    } else {
      // 🛡️ ADMIN/OPERATOR: See ALL complaints in YOUR office
      query = `SELECT 
        c.id,
        c.issue_no,
        c.complaint_date,
        c.person_name,
        c.contact,
        c.address,
        c.gender,
        c.description,
        c.status,
        c.ward_no,
        c.area,
        r.reason_name,
        u.name AS written_by
       FROM complaints c
       LEFT JOIN reasons r ON c.reason_id = r.id
       LEFT JOIN users u ON c.written_by_user_id = u.id
       WHERE c.office_id = $1
       ORDER BY c.complaint_date DESC`;
      queryParams.push(officeId);
    }

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("GET ALL COMPLAINTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// UPDATE COMPLAINT STATUS
// ============================
exports.updateComplaintStatus = async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;
  const { officeId, userId, role } = req.user;

  // 🛡️ PERMISSION GUARD: Regular citizens cannot update status
  if (role === "USER") {
    return res.status(403).json({ message: "Access denied: Citizens cannot modify status" });
  }

  const allowedStatuses = ["NEW", "IN_PROCESS", "COMPLETED"];

  if (!allowedStatuses.includes(newStatus)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    // Verify complaint belongs to this office
    const complaintResult = await pool.query(
      `SELECT status FROM complaints
       WHERE id = $1 AND office_id = $2`,
      [id, officeId]
    );

    if (complaintResult.rows.length === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const oldStatus = complaintResult.rows[0].status;

    // Update status
    await pool.query(
      `UPDATE complaints
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [newStatus, id]
    );

    // Insert status history
    const historyId = uuidv4();

    await pool.query(
      `INSERT INTO status_history (
        id,
        complaint_id,
        old_status,
        new_status,
        changed_by_user_id
      )
      VALUES ($1, $2, $3, $4, $5)`,
      [historyId, id, oldStatus, newStatus, userId]
    );

    // ✅ Fetch actual user name
    const userRes = await pool.query(`SELECT name FROM users WHERE id = $1`, [userId]);
    const userName = userRes.rows[0]?.name || "Staff";

    await logActivity(userId, userName, "STATUS UPDATE", `Updated status to ${newStatus}`);

    // ==========================================
    // 📩 SMS NOTIFICATION (ON COMPLETION)
    // ==========================================
    if (newStatus === "COMPLETED") {
      try {
        // Use the existing service path
        const { sendSMS } = require("../services/sms.service");

        const complaintInfo = await pool.query(
          `SELECT issue_no, contact FROM complaints WHERE id = $1`,
          [id]
        );

        if (complaintInfo.rows.length > 0) {
          const { issue_no, contact } = complaintInfo.rows[0];

          if (contact) {
            // Send SMS
            await sendSMS({
              phone: contact,
              message: `Your complaint ${issue_no} has been resolved. Thank you.`,
            });

            // Log SMS Activity (Using existing logger signature)
            await logActivity(
              userId,
              userName,
              "SMS_SENT",
              `SMS sent to ${contact} for complaint ${issue_no}`
            );
          }
        }
      } catch (err) {
        console.error("SMS Logic Failed:", err.message);
      }
    }

    res.json({ message: "Complaint status updated successfully" });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// GET STATUS HISTORY
// ============================
exports.getStatusHistory = async (req, res) => {
  const { id } = req.params;
  const { officeId } = req.user;

  try {
    // Verify complaint belongs to office
    const check = await pool.query(
      `SELECT id FROM complaints
       WHERE id = $1 AND office_id = $2`,
      [id, officeId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const result = await pool.query(
      `SELECT
        sh.old_status,
        sh.new_status,
        sh.changed_at,
        u.name AS changed_by
       FROM status_history sh
       LEFT JOIN users u ON sh.changed_by_user_id = u.id
       WHERE sh.complaint_id = $1
       ORDER BY sh.changed_at ASC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("GET STATUS HISTORY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};