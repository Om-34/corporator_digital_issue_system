const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

exports.uploadDocument = async (req, res) => {
  try {
    const { complaintId } = req.params;

    // ❌ Case 1: No file sent
    if (!req.file) {
      return res.status(400).json({
        code: "NO_FILE",
        message: "No file was received. Please select a file before uploading.",
      });
    }

    // ❌ Case 2: Missing complaintId
    if (!complaintId) {
      return res.status(400).json({
        code: "INVALID_COMPLAINT",
        message: "Invalid complaint reference.",
      });
    }

    await pool.query(
      `INSERT INTO complaint_documents
       (id, complaint_id, file_name, file_path)
       VALUES ($1, $2, $3, $4)`,
      [
        uuidv4(),
        complaintId,
        req.file.originalname,
        `/uploads/complaints/${req.file.filename}`,
      ]
    );

    res.status(201).json({
      message: "Document uploaded successfully",
    });
  } catch (error) {
    console.error("DOCUMENT UPLOAD ERROR:", error);

    // ❌ Case 3: Database or server error
    res.status(500).json({
      code: "SERVER_ERROR",
      message: "Server failed while saving document. Please try again.",
    });
  }
};

// ✅ ADDED: Function to fetch documents for a specific complaint
exports.getDocumentsByComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const result = await pool.query(
      `SELECT id, file_name, file_path
       FROM complaint_documents
       WHERE complaint_id = $1
       ORDER BY uploaded_at DESC`, // Note: Ensure your column is 'uploaded_at' or 'created_at' to match your DB
      [complaintId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("GET DOCUMENTS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch documents",
    });
  }
};