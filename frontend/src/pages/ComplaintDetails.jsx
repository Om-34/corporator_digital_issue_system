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

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchComplaint();
    fetchHistory();
  }, []);

  // 🔒 LOGIC UNCHANGED
  const fetchComplaint = async () => {
    const res = await api.get("/complaints");
    const found = res.data.find((c) => c.id === id);
    setComplaint(found);
  };

  // 🔒 LOGIC UNCHANGED
  const fetchHistory = async () => {
    const res = await api.get(`/complaints/${id}/status-history`);
    setHistory(res.data);
  };

  // 🔒 LOGIC UNCHANGED
  const updateStatus = async () => {
    if (!newStatus) {
      alert("Select status");
      return;
    }

    await api.patch(`/complaints/${id}/status`, {
      newStatus,
    });

    alert("Status updated");
    setNewStatus("");
    fetchComplaint();
    fetchHistory();
  };

  // =========================
  // 📍 OPEN IN GOOGLE MAPS
  // =========================
  const openInMaps = () => {
    const fullAddress = [
      complaint.address,
      complaint.area,
      complaint.ward_no ? `Ward ${complaint.ward_no}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    // Using standard Google Maps Search URL
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      fullAddress
    )}`;

    window.open(mapsUrl, "_blank");
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
      <Typography variant="h6" gutterBottom>
        Complaint Details
      </Typography>

      {/* BASIC INFO */}
      <Box sx={{ mb: 2 }}>
        <Typography><strong>Issue No:</strong> {complaint.issue_no}</Typography>
        <Typography><strong>Person:</strong> {complaint.person_name}</Typography>
        <Typography><strong>Category:</strong> {complaint.reason_name}</Typography>

        {/* ✅ NEW: ADDRESS & MAP BUTTON */}
        <Typography sx={{ mt: 1 }}>
          <strong>Address:</strong> {complaint.address || "-"}
        </Typography>

        <Typography sx={{ mt: 0.5 }}>
          <strong>Area:</strong> {complaint.area || "-"}
        </Typography>

        <Typography sx={{ mt: 0.5 }}>
          <strong>Ward:</strong> {complaint.ward_no || "-"}
        </Typography>

        <Button
          sx={{ mt: 2 }}
          variant="outlined"
          onClick={openInMaps}
        >
          📍 Open in Google Maps
        </Button>

        {/* DETAILED COMPLAINT SECTION */}
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
          <strong>Status:</strong>{" "}
          <StatusChip status={complaint.status} />
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

          <Button
            variant="contained"
            onClick={updateStatus}
          >
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

/* =====================
   STATUS CHIP (UI ONLY)
   ===================== */

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