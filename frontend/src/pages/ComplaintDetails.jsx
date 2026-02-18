import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

import {
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
} from "@mui/material";

// ✅ ADDED: Icons & PDF Tools
import PrintIcon from "@mui/icons-material/Print";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [documents, setDocuments] = useState([]); // ✅ NEW: State for documents
  const [newStatus, setNewStatus] = useState("");
  const [file, setFile] = useState(null); // ✅ ADDED: State for the file input

  useEffect(() => {
    fetchComplaint();
    fetchHistory();
    fetchDocuments(); // ✅ NEW: Fetch docs on load
  }, []);

  // 🔒 LOGIC UNCHANGED
  const fetchComplaint = async () => {
    try {
      const res = await api.get("/complaints");
      const found = res.data.find((c) => c.id === id);
      setComplaint(found);
    } catch (error) {
      console.error("Error fetching complaint:", error);
    }
  };

  // 🔒 LOGIC UNCHANGED
  const fetchHistory = async () => {
    try {
      const res = await api.get(`/complaints/${id}/status-history`);
      setHistory(res.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  // ✅ NEW: Fetch Documents
  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/complaint-documents/${id}`);
      setDocuments(res.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  // ✅ ADDED: Your specific handleUpload logic
  const handleUpload = async () => {
    if (!file) {
      alert("Select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("document", file); // 🔴 MUST MATCH multer

    try {
      await api.post(
        `/complaint-documents/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("Document uploaded");
      fetchDocuments();
      setFile(null);
    }  catch (err) {
      console.error("UPLOAD ERROR:", err);

      if (err.response) {
        // Backend responded with reason (e.g., folder missing, DB error)
        alert(err.response.data.message || "Server rejected the upload");
      } else if (err.request) {
        // Request was made but backend didn't respond (Server might be crashed)
        alert("Server not reachable. Check if backend is running.");
      } else {
        // Something went wrong setting up the request
        alert("Unexpected error occurred while uploading.");
      }
    }
  };

  // 🔒 LOGIC UNCHANGED
  const updateStatus = async () => {
    if (!newStatus) {
      alert("Select status");
      return;
    }

    try {
      await api.patch(`/complaints/${id}/status`, {
        newStatus,
      });

      alert("Status updated");
      setNewStatus("");
      fetchComplaint();
      fetchHistory();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  // =========================
  // 📍 OPEN IN GOOGLE MAPS (UNCHANGED)
  // =========================
  const openInMaps = () => {
    const fullAddress = [
      complaint.address,
      complaint.area,
      complaint.ward_no ? `Ward ${complaint.ward_no}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      fullAddress
    )}`;

    window.open(mapsUrl, "_blank");
  };

  // ==============================
  // 🖨️ GENERATE WORK ORDER PDF (UPDATED)
  // ==============================
  const downloadWorkOrder = () => {
    try {
      const doc = new jsPDF("p", "mm", "a4");

      /* ================= HEADER ================= */
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("CORPORATOR OFFICE", 105, 15, { align: "center" });

      doc.setFontSize(14);
      doc.text("WORK ORDER / COMPLAINT JOB CARD", 105, 24, {
        align: "center",
      });

      doc.setLineWidth(0.5);
      doc.line(15, 28, 195, 28);

      /* ================= ISSUE INFO ================= */
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      doc.text(`Issue No: ${complaint.issue_no}`, 15, 36);
      doc.text(
        `Date: ${new Date(complaint.complaint_date).toLocaleDateString()}`,
        150,
        36
      );

      /* ================= STATUS ================= */
      doc.setFont("helvetica", "bold");
      doc.text(`Status: ${complaint.status}`, 15, 44);

      /* ================= DETAILS TABLE ================= */
      autoTable(doc, {
        startY: 50,
        head: [["Field", "Details"]],
        body: [
          ["Complainant Name", complaint.person_name],
          ["Contact Number", complaint.contact || "-"],
          [
            "Ward / Area",
            `${complaint.ward_no || "-"} / ${complaint.area || "-"}`,
          ],
          ["Address", complaint.address || "—"],
          ["Category", complaint.reason_name],
        ],
        styles: {
          fontSize: 11,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [25, 118, 210],
          textColor: 255,
        },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 55 },
          1: { cellWidth: 120 },
        },
      });

      /* ================= DESCRIPTION ================= */
      let y = doc.lastAutoTable.finalY + 10;

      doc.setFont("helvetica", "bold");
      doc.text("Detailed Complaint / Work Instructions:", 15, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      const desc = doc.splitTextToSize(
        complaint.description || "No description provided",
        170
      );

      doc.text(desc, 15, y + 8);

      /* ================= SIGNATURES ================= */
      const signY = 260;

      doc.line(15, signY, 80, signY);
      doc.text("Worker Signature", 15, signY + 6);

      doc.line(120, signY, 190, signY);
      doc.text("Corporator Office Sign", 120, signY + 6);

      /* ================= FOOTER ================= */
      doc.setFontSize(9);
      doc.text(
        "This is a system-generated document",
        105,
        285,
        { align: "center" }
      );

      doc.save(`Complaint_${complaint.issue_no}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to generate complaint PDF");
    }
  };

  if (!complaint) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading complaint...</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 800 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Complaint Details</Typography>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<PrintIcon />}
          onClick={downloadWorkOrder}
          size="small"
        >
          Print Job Card
        </Button>
      </Box>

      {/* BASIC INFO */}
      <Box sx={{ mb: 2 }}>
        <Typography>
          <strong>Issue No:</strong> {complaint.issue_no}
        </Typography>
        <Typography>
          <strong>Person:</strong> {complaint.person_name}
        </Typography>
        <Typography>
          <strong>Category:</strong> {complaint.reason_name}
        </Typography>

        <Typography sx={{ mt: 1 }}>
          <strong>Address:</strong> {complaint.address || "-"}
        </Typography>

        <Typography sx={{ mt: 0.5 }}>
          <strong>Area:</strong> {complaint.area || "-"}
        </Typography>

        <Typography sx={{ mt: 0.5 }}>
          <strong>Ward:</strong> {complaint.ward_no || "-"}
        </Typography>

        <Button sx={{ mt: 2 }} variant="outlined" onClick={openInMaps}>
          📍 Open in Google Maps
        </Button>

        <Typography sx={{ mt: 2 }}>
          <strong>Detailed Complaint:</strong>
        </Typography>

        <Box
          sx={{
            mt: 1,
            mb: 2,
            p: 2,
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2">
            {complaint.description || "No description provided"}
          </Typography>
        </Box>

        <Box sx={{ mt: 1 }}>
          <strong>Status:</strong> <StatusChip status={complaint.status} />
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* ================================== */}
      {/* 📁 DIGITAL ARCHIVE (UPDATED)       */}
      {/* ================================== */}
      <Box sx={{ mb: 4, p: 2, border: "1px dashed #ccc", borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Attached Documents
        </Typography>

        <Box sx={{ mt: 2, mb: 2 }}>
          {documents.length === 0 ? (
            <Typography color="text.secondary">
              No document attached
            </Typography>
          ) : (
            documents.map((doc) => (
              <Button
                key={doc.id}
                variant="outlined"
                href={`http://localhost:5000${doc.file_path}`}
                target="_blank"
                sx={{ mr: 1, mt: 1 }}
              >
                View Document
              </Button>
            ))
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          Add New Document
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button variant="contained" component="label" size="small">
            {file ? file.name : "Choose File"}
            <input
              type="file"
              hidden
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </Button>

          <Button 
            variant="contained" 
            color="primary" 
            size="small" 
            onClick={handleUpload}
            disabled={!file}
          >
            Upload
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* UPDATE STATUS */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1">Update Status</Typography>

        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
          <Button
            variant={newStatus === "NEW" ? "contained" : "outlined"}
            onClick={() => setNewStatus("NEW")}
          >
            NEW
          </Button>

          <Button
            variant={newStatus === "IN_PROCESS" ? "contained" : "outlined"}
            color="warning"
            onClick={() => setNewStatus("IN_PROCESS")}
          >
            IN PROCESS
          </Button>

          <Button
            variant={newStatus === "COMPLETED" ? "contained" : "outlined"}
            color="success"
            onClick={() => setNewStatus("COMPLETED")}
          >
            COMPLETED
          </Button>

          <Button variant="contained" onClick={updateStatus}>
            Save
          </Button>
        </Box>
      </Box>

      {/* STATUS HISTORY */}
      <Typography variant="subtitle1" gutterBottom>
        Status History
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Old Status</TableCell>
            <TableCell>New Status</TableCell>
            <TableCell>Changed By</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {history.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                No history available
              </TableCell>
            </TableRow>
          ) : (
            history.map((h, i) => (
              <TableRow key={i}>
                <TableCell>{h.old_status}</TableCell>
                <TableCell>
                  <StatusChip status={h.new_status} />
                </TableCell>
                <TableCell>{h.changed_by}</TableCell>
                <TableCell>
                  {new Date(h.changed_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Box sx={{ mt: 3 }}>
        <Button variant="outlined" onClick={() => navigate("/complaints")}>
          Back
        </Button>
      </Box>
    </Paper>
  );
};

const StatusChip = ({ status }) => {
  switch (status) {
    case "NEW":
      return <Chip label="NEW" variant="outlined" />;
    case "IN_PROCESS":
      return <Chip label="IN PROCESS" color="warning" />;
    case "COMPLETED":
      return <Chip label="COMPLETED" color="success" />;
    default:
      return <Chip label={status} />;
  }
};

export default ComplaintDetails;