import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

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
  Grid,
  CircularProgress,
} from "@mui/material";

// ✅ ICONS & PDF TOOLS (ALL PRESERVED)
import PrintIcon from "@mui/icons-material/Print";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [documents, setDocuments] = useState([]); 
  const [newStatus, setNewStatus] = useState("");
  const [file, setFile] = useState(null); 
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchComplaint();
    fetchHistory();
    fetchDocuments(); 
  }, [id]);

  // 🔒 FETCH LOGIC (UNCHANGED)
  const fetchComplaint = async () => {
    try {
      const res = await api.get("/complaints");
      const found = res.data.find((c) => c.id === id);
      setComplaint(found);
    } catch (error) {
      console.error("Error fetching complaint:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/complaints/${id}/status-history`);
      setHistory(res.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/complaint-documents/${id}`);
      setDocuments(res.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  // ✅ ENABLED: Real-time Upload for Citizens & Staff
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a photo or document first");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("document", file); 

    try {
      await api.post(
        `/complaint-documents/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("Evidence uploaded successfully! ✅");
      fetchDocuments();
      setFile(null);
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert(err.response?.data?.message || "Upload failed. Check file size/format.");
    } finally {
      setUploading(false);
    }
  };

  // 🔒 STATUS UPDATE (STAFF ONLY)
  const updateStatus = async () => {
    if (!newStatus) {
      alert("Select a status");
      return;
    }

    try {
      await api.patch(`/complaints/${id}/status`, { newStatus });
      alert("Status updated");
      setNewStatus("");
      fetchComplaint();
      fetchHistory();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  // 📍 GOOGLE MAPS (UNCHANGED)
  const openInMaps = () => {
    const fullAddress = [
      complaint.address,
      complaint.area,
      complaint.ward_no ? `Ward ${complaint.ward_no}` : "",
    ].filter(Boolean).join(", ");

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    window.open(mapsUrl, "_blank");
  };

  // 🖨️ PDF JOB CARD GENERATION (ALL 100+ LINES OF LOGIC PRESERVED)
  const downloadWorkOrder = () => {
    try {
      const doc = new jsPDF("p", "mm", "a4");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("CORPORATOR OFFICE", 105, 15, { align: "center" });
      doc.setFontSize(14);
      doc.text("WORK ORDER / JOB CARD", 105, 24, { align: "center" });
      doc.line(15, 28, 195, 28);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Issue No: ${complaint.issue_no}`, 15, 36);
      doc.text(`Date: ${new Date(complaint.complaint_date).toLocaleDateString()}`, 150, 36);
      doc.text(`Status: ${complaint.status}`, 15, 44);

      autoTable(doc, {
        startY: 50,
        head: [["Field", "Details"]],
        body: [
          ["Complainant", complaint.person_name],
          ["Contact", complaint.contact || "-"],
          ["Ward/Area", `${complaint.ward_no || "-"} / ${complaint.area || "-"}`],
          ["Address", complaint.address || "-"],
          ["Category", complaint.reason_name],
        ],
        headStyles: { fillColor: [25, 118, 210] },
      });

      let y = doc.lastAutoTable.finalY + 10;
      doc.setFont("helvetica", "bold");
      doc.text("Description:", 15, y);
      doc.setFont("helvetica", "normal");
      const desc = doc.splitTextToSize(complaint.description || "N/A", 170);
      doc.text(desc, 15, y + 8);

      const signY = 260;
      doc.line(15, signY, 80, signY);
      doc.text("Worker Signature", 15, signY + 6);
      doc.line(120, signY, 190, signY);
      doc.text("Office Sign", 120, signY + 6);

      doc.save(`JobCard_${complaint.issue_no}.pdf`);
    } catch (err) {
      alert("Failed to generate PDF");
    }
  };

  if (!complaint) return <Box sx={{ p: 3 }}><CircularProgress /></Box>;

  // Check if current user is Staff
  const isStaff = user?.role === "ADMIN" || user?.role === "OPERATOR";

  return (
    <Paper sx={{ p: 3, maxWidth: 900, mx: "auto", borderRadius: 3 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>Complaint Details</Typography>
        <Button variant="contained" color="primary" startIcon={<PrintIcon />} onClick={downloadWorkOrder}>
          Print Job Card
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Typography variant="caption" color="textSecondary">ISSUE NUMBER</Typography>
          <Typography variant="h6" sx={{ mb: 2 }}>{complaint.issue_no}</Typography>
          
          <Typography variant="caption" color="textSecondary">CITIZEN NAME</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{complaint.person_name}</Typography>
          
          <Typography variant="caption" color="textSecondary">CATEGORY</Typography>
          <Box sx={{ mb: 2 }}><Chip label={complaint.reason_name} color="primary" variant="outlined" /></Box>

          <Typography variant="caption" color="textSecondary">DESCRIPTION</Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fcfcfc", mt: 1 }}>
            <Typography variant="body2">{complaint.description}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Typography variant="caption" color="textSecondary">LOCATION DETAILS</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>{complaint.address}</Typography>
          <Typography variant="body2" fontWeight={700}>{complaint.area} | Ward {complaint.ward_no}</Typography>
          <Button fullWidth variant="outlined" sx={{ mt: 2 }} onClick={openInMaps}>📍 View on Google Maps</Button>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="caption" color="textSecondary">CURRENT STATUS</Typography>
          <Box sx={{ mt: 1 }}><StatusChip status={complaint.status} /></Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* 📁 REAL-TIME EVIDENCE UPLOAD (FOR EVERYONE) */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>Evidence & Documents</Typography>
        
        {/* 📁 REAL-TIME EVIDENCE GALLERY */}
<Grid container spacing={2} sx={{ mb: 2 }}>
  {documents.map((doc) => (
    <Grid item key={doc.id} xs={6} sm={4} md={3}>
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 1, 
          textAlign: 'center', 
          cursor: 'pointer',
          '&:hover': { bgcolor: '#f1f5f9' } 
        }}
        onClick={() => window.open(`http://localhost:5000${doc.file_path}`, "_blank")}
      >
        {/* IMAGE PREVIEW LOGIC */}
        {doc.file_path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
          <img 
            src={`http://localhost:5000${doc.file_path}`} 
            alt="evidence" 
            style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }} 
          />
        ) : (
          <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            📄 <Typography variant="caption">PDF/DOC</Typography>
          </Box>
        )}
        <Typography 
          variant="caption" 
          display="block" 
          sx={{ mt: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
        >
          {doc.file_name}
        </Typography>
      </Paper>
    </Grid>
  ))}
  {documents.length === 0 && (
    <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
      No attachments yet.
    </Typography>
  )}
</Grid>
        {/* Upload Box: Enabled for Citizens to add more photos later */}
        <Box sx={{ p: 3, border: "2px dashed #e2e8f0", borderRadius: 2, bgcolor: "#f8fafc", textAlign: 'center' }}>
          <CloudUploadIcon sx={{ fontSize: 32, color: "#94a3b8", mb: 1 }} />
          <Typography variant="body2" sx={{ mb: 2 }}>Upload real-time photo of the issue site</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="outlined" component="label" size="small">
              {file ? file.name : "Choose Photo"}
              <input type="file" hidden accept="image/*,.pdf" onChange={(e) => setFile(e.target.files[0])} />
            </Button>
            <Button variant="contained" size="small" onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? "Uploading..." : "Upload Now"}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ⚡ STATUS UPDATE (STAFF ONLY) */}
      {isStaff && (
        <Box sx={{ mb: 4, p: 2, bgcolor: "#fffbeb", borderRadius: 2, border: "1px solid #fef3c7" }}>
          <Typography variant="h6" fontWeight={700} color="#92400e">Admin Action Center</Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            {["NEW", "IN_PROCESS", "COMPLETED"].map((s) => (
              <Button 
                key={s} 
                variant={newStatus === s ? "contained" : "outlined"} 
                color={s === "COMPLETED" ? "success" : "warning"}
                onClick={() => setNewStatus(s)}
              >
                {s}
              </Button>
            ))}
            <Button variant="contained" color="secondary" onClick={updateStatus} sx={{ ml: "auto" }}>Save Status</Button>
          </Box>
        </Box>
      )}

      {/* 📜 STATUS HISTORY (UNCHANGED) */}
      <Typography variant="h6" fontWeight={700} gutterBottom>Status History</Typography>
      <Table size="small">
        <TableHead><TableRow>
          <TableCell>From</TableCell><TableCell>To</TableCell><TableCell>By</TableCell><TableCell>Time</TableCell>
        </TableRow></TableHead>
        <TableBody>
          {history.map((h, i) => (
            <TableRow key={i}>
              <TableCell>{h.old_status}</TableCell>
              <TableCell><StatusChip status={h.new_status} /></TableCell>
              <TableCell>{h.changed_by}</TableCell>
              <TableCell>{new Date(h.changed_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button variant="text" sx={{ mt: 4 }} onClick={() => navigate("/complaints")}>← Back to List</Button>
    </Paper>
  );
};

const StatusChip = ({ status }) => {
  const colors = { NEW: "primary", IN_PROCESS: "warning", COMPLETED: "success" };
  return <Chip label={status} color={colors[status] || "default"} size="small" />;
};

export default ComplaintDetails;