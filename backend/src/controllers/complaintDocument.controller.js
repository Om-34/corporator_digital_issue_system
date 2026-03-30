const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

exports.uploadDocument = async (req, res) => {
  try {
    const { complaintId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        code: "NO_FILE",
        message: "No file received.",
      });
    }

    if (!complaintId) {
      return res.status(400).json({
        code: "INVALID_COMPLAINT",
        message: "Invalid complaint reference.",
      });
    }

    // ✅ Added explicit ::uuid casting for the database parameters
    await pool.query(
      `INSERT INTO complaint_documents
        (id, complaint_id, file_name, file_path)
        VALUES ($1::uuid, $2::uuid, $3, $4)`,
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
    res.status(500).json({
      code: "SERVER_ERROR",
      message: "Server failed while saving document.",
    });
  }
};

exports.getDocumentsByComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const result = await pool.query(
      `SELECT id, file_name, file_path
       FROM complaint_documents
       WHERE complaint_id = $1::uuid
       ORDER BY uploaded_at DESC`,
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