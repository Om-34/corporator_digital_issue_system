import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Grid,
  Drawer,
  Divider,
  MenuItem,
  Button,
  Chip,
} from "@mui/material";

import FilterListIcon from "@mui/icons-material/FilterList";

const WardReports = () => {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  
  // 🔍 FILTERS
  const [wardFilter, setWardFilter] = useState("");
  const [sortBy, setSortBy] = useState("total"); // 'total', 'inProcess', 'completed'
  const [minComplaints, setMinComplaints] = useState(0);
  
  // 📅 DATE FILTERS
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Drill-down UI state
  const [selectedWard, setSelectedWard] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get("/complaints");
      setComplaints(res.data);
    } catch (error) {
      console.error("Failed to fetch complaints");
    }
  };

  /* =========================
       WARD AGGREGATION (With Date Logic)
     ========================= */
  const wardWiseData = complaints.reduce((acc, c) => {
    // 1. 📅 DATE CHECK
    const cDate = new Date(c.complaint_date).getTime();
    let startLimit = null;
    let endLimit = null;

    if (fromDate) {
      const [y, m, d] = fromDate.split("-").map(Number);
      startLimit = new Date(y, m - 1, d).getTime();
    }
    if (toDate) {
      const [y, m, d] = toDate.split("-").map(Number);
      endLimit = new Date(y, m - 1, d).setHours(23, 59, 59, 999);
    }

    if (startLimit && cDate < startLimit) return acc;
    if (endLimit && cDate > endLimit) return acc;

    // 2. STANDARD AGGREGATION
    const ward = c.ward || c.area || "Unknown";

    if (!acc[ward]) {
      acc[ward] = {
        ward,
        total: 0,
        completed: 0,
        inProcess: 0,
        new: 0,
      };
    }

    acc[ward].total += 1;
    if (c.status === "COMPLETED") acc[ward].completed += 1;
    if (c.status === "IN_PROCESS") acc[ward].inProcess += 1;
    if (c.status === "NEW") acc[ward].new += 1;

    return acc;
  }, {});

  // 🔍 APPLY FILTERS & SORTING
  const rows = Object.values(wardWiseData)
    .filter((w) => {
      const matchesName = wardFilter
        ? w.ward.toLowerCase().includes(wardFilter.toLowerCase())
        : true;
      const matchesMinCount = w.total >= minComplaints;
      return matchesName && matchesMinCount;
    })
    .sort((a, b) => {
      return b[sortBy] - a[sortBy];
    });

  /* =========================
       DRILL-DOWN HANDLERS
     ========================= */
  const openWardDetails = (ward) => {
    setSelectedWard(ward);
    setOpenDrawer(true);
  };

  // Filter Drill-down list by date too
  const wardComplaints = complaints.filter((c) => {
    const ward = c.ward || c.area || "Unknown";
    
    const cDate = new Date(c.complaint_date).getTime();
    let startLimit = null;
    let endLimit = null;

    if (fromDate) {
      const [y, m, d] = fromDate.split("-").map(Number);
      startLimit = new Date(y, m - 1, d).getTime();
    }
    if (toDate) {
      const [y, m, d] = toDate.split("-").map(Number);
      endLimit = new Date(y, m - 1, d).setHours(23, 59, 59, 999);
    }

    const dateMatch = (!startLimit || cDate >= startLimit) && (!endLimit || cDate <= endLimit);

    return ward === selectedWard && dateMatch;
  });

  const openComplaintDetails = (id) => {
    navigate(`/complaints/${id}`);
  };

  return (
    <>
      {/* MAIN REPORT */}
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: "0 12px 40px rgba(0,0,0,0.14)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Ward / Area-wise Complaints Report
          </Typography>
          
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />}
            onClick={() => {
              setWardFilter("");
              setSortBy("total");
              setMinComplaints(0);
              setFromDate("");
              setToDate("");
            }}
          >
            Reset Filters
          </Button>
        </Box>

        {/* 🔍 FILTER BAR */}
        <Grid container spacing={2} mb={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search Ward / Area"
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              type="date"
              size="small"
              fullWidth
              label="From"
              InputLabelProps={{ shrink: true }}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              type="date"
              size="small"
              fullWidth
              label="To"
              InputLabelProps={{ shrink: true }}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Sort By (Highest First)"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="total">Total Complaints</MenuItem>
              <MenuItem value="inProcess">Pending (In Process)</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              type="number"
              fullWidth
              size="small"
              label="Min. Count"
              value={minComplaints}
              onChange={(e) => setMinComplaints(Number(e.target.value))}
            />
          </Grid>
        </Grid>

        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              <TableCell><strong>Ward / Area</strong></TableCell>
              <TableCell><strong>Total</strong></TableCell>
              <TableCell><strong>In Process</strong></TableCell>
              <TableCell><strong>Completed</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3, color: "gray" }}>
                  No areas found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow
                  key={index}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => openWardDetails(row.ward)}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{row.ward}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {row.total}
                      <Box 
                        sx={{ 
                          height: 6, 
                          width: `${Math.min(row.total * 5, 100)}px`, 
                          bgcolor: "#3b82f6", 
                          borderRadius: 1 
                        }} 
                      />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: row.inProcess > 0 ? "orange" : "inherit", fontWeight: row.inProcess > 0 ? "bold" : "normal" }}>
                    {row.inProcess}
                  </TableCell>
                  <TableCell sx={{ color: "green" }}>{row.completed}</TableCell>
                  <TableCell>
                    <Button size="small" variant="text">View Details</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* =========================
          DRILL-DOWN DRAWER
         ========================= */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        PaperProps={{ sx: { width: { xs: "100%", md: 600 }, p: 3 } }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {selectedWard} 
            {fromDate && <span style={{fontSize: "0.8rem", color: "gray", marginLeft: "10px"}}>({new Date(fromDate).toLocaleDateString()} - {toDate ? new Date(toDate).toLocaleDateString() : "Now"})</span>}
          </Typography>
          <Button onClick={() => setOpenDrawer(false)}>Close</Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* CATEGORY BREAKDOWN CHIPS */}
        {wardComplaints.length > 0 && (
          <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
            {Object.entries(
              wardComplaints.reduce((acc, c) => {
                acc[c.reason_name] = (acc[c.reason_name] || 0) + 1;
                return acc;
              }, {})
            )
            .sort((a, b) => b[1] - a[1]) // Sort highest first
            .slice(0, 3) // Show top 3
            .map(([category, count]) => (
              <Chip 
                key={category} 
                label={`${category}: ${count}`} 
                color="primary" 
                variant="outlined" 
                size="small" 
              />
            ))}
          </Box>
        )}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Issue No</TableCell>
              <TableCell>Person</TableCell>
              <TableCell>Category</TableCell> {/* ✅ ADDED COLUMN */}
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {wardComplaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No complaints in this range
                </TableCell>
              </TableRow>
            ) : (
              wardComplaints.map((c) => (
                <TableRow
                  key={c.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => openComplaintDetails(c.id)}
                >
                  <TableCell>{c.issue_no}</TableCell>
                  <TableCell>{c.person_name}</TableCell>
                  <TableCell>{c.reason_name}</TableCell> {/* ✅ ADDED DATA */}
                  <TableCell>
                    <span style={{ 
                      fontWeight: "bold", 
                      fontSize: "0.8rem",
                      color: c.status === "COMPLETED" ? "green" : c.status === "IN_PROCESS" ? "orange" : "blue"
                    }}>
                      {c.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Drawer>
    </>
  );
};

export default WardReports;