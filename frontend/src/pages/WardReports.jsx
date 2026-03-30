import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

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
  CircularProgress,
} from "@mui/material";

import FilterListIcon from "@mui/icons-material/FilterList";

const WardReports = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🔍 FILTERS
  const [wardFilter, setWardFilter] = useState("");
  const [sortBy, setSortBy] = useState("total");
  const [minComplaints, setMinComplaints] = useState(0);
  
  // 📅 DATE FILTERS
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Drill-down UI state
  const [selectedWard, setSelectedWard] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);

  // 🛡️ Role Check: If somehow a Citizen gets here, kick them out
  useEffect(() => {
    if (user?.role === "USER") {
      navigate("/dashboard");
    }
    fetchComplaints();
  }, [user, navigate]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      // Backend automatically filters by office_id
      const res = await api.get("/complaints");
      setComplaints(res.data);
    } catch (error) {
      console.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
        WARD AGGREGATION
     ========================= */
  const wardWiseData = complaints.reduce((acc, c) => {
    // 1. 📅 DATE CHECK
    const cDate = new Date(c.complaint_date).getTime();
    let startLimit = fromDate ? new Date(fromDate).getTime() : null;
    let endLimit = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : null;

    if (startLimit && cDate < startLimit) return acc;
    if (endLimit && cDate > endLimit) return acc;

    // 2. STANDARD AGGREGATION
    const ward = c.ward_no ? `Ward ${c.ward_no}` : (c.area || "General");

    if (!acc[ward]) {
      acc[ward] = { ward, total: 0, completed: 0, inProcess: 0, new: 0 };
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
      const matchesName = wardFilter ? w.ward.toLowerCase().includes(wardFilter.toLowerCase()) : true;
      return matchesName && w.total >= minComplaints;
    })
    .sort((a, b) => b[sortBy] - a[sortBy]);

  /* =========================
        DRILL-DOWN HANDLERS
     ========================= */
  const openWardDetails = (wardName) => {
    setSelectedWard(wardName);
    setOpenDrawer(true);
  };

  const wardComplaints = complaints.filter((c) => {
    const wardName = c.ward_no ? `Ward ${c.ward_no}` : (c.area || "General");
    
    const cDate = new Date(c.complaint_date).getTime();
    let startLimit = fromDate ? new Date(fromDate).getTime() : null;
    let endLimit = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : null;

    const dateMatch = (!startLimit || cDate >= startLimit) && (!endLimit || cDate <= endLimit);
    return wardName === selectedWard && dateMatch;
  });

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Paper sx={{ p: 4, borderRadius: 4, border: "1px solid #e2e8f0", elevation: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 4 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#1e293b">Ward Performance Audit</Typography>
            <Typography variant="body2" color="textSecondary">Analyze complaint distribution and resolution efficiency across areas.</Typography>
          </Box>
          
          <Button 
            variant="outlined" 
            size="small"
            startIcon={<FilterListIcon />}
            onClick={() => {
              setWardFilter(""); setSortBy("total"); setMinComplaints(0); setFromDate(""); setToDate("");
            }}
          >
            Reset Filters
          </Button>
        </Box>

        {/* 🔍 FILTER BAR */}
        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" label="Search Ward/Area" value={wardFilter} onChange={(e) => setWardFilter(e.target.value)} />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField type="date" size="small" fullWidth label="From" InputLabelProps={{ shrink: true }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField type="date" size="small" fullWidth label="To" InputLabelProps={{ shrink: true }} value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField select fullWidth size="small" label="Priority Metric" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <MenuItem value="total">Total Complaints</MenuItem>
              <MenuItem value="inProcess">Active (In Process)</MenuItem>
              <MenuItem value="completed">Resolved</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField type="number" fullWidth size="small" label="Min. Count" value={minComplaints} onChange={(e) => setMinComplaints(Number(e.target.value))} />
          </Grid>
        </Grid>

        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              <TableCell sx={{ fontWeight: 700 }}>Ward / Area</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Total Load</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Pending</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Completed</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Detail View</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index} hover sx={{ cursor: "pointer" }} onClick={() => openWardDetails(row.ward)}>
                <TableCell sx={{ fontWeight: 600 }}>{row.ward}</TableCell>
                <TableCell>
                   <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                     {row.total}
                     <Box sx={{ height: 6, width: `${Math.min(row.total * 3, 60)}px`, bgcolor: "#6366f1", borderRadius: 1 }} />
                   </Box>
                </TableCell>
                <TableCell>
                  <Chip label={row.inProcess} size="small" color={row.inProcess > 0 ? "warning" : "default"} sx={{ fontWeight: 700 }} />
                </TableCell>
                <TableCell sx={{ color: "success.main", fontWeight: 700 }}>{row.completed}</TableCell>
                <TableCell align="right">
                  <Button size="small">Analyze</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* 🚀 DRILL-DOWN DRAWER */}
      <Drawer anchor="right" open={openDrawer} onClose={() => setOpenDrawer(false)} PaperProps={{ sx: { width: { xs: "100%", md: 550 }, p: 3 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={800}>{selectedWard}</Typography>
          <Typography variant="caption" color="textSecondary">Showing all filtered records for this area</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Table size="small">
          <TableHead><TableRow>
            <TableCell>Issue No</TableCell><TableCell>Category</TableCell><TableCell>Status</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {wardComplaints.map((c) => (
              <TableRow key={c.id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/complaints/${c.id}`)}>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{c.issue_no}</TableCell>
                <TableCell sx={{ fontSize: '0.8rem' }}>{c.reason_name}</TableCell>
                <TableCell>
                  <Chip label={c.status} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button fullWidth variant="contained" sx={{ mt: 4, bgcolor: "#1e293b" }} onClick={() => setOpenDrawer(false)}>Close Sidebar</Button>
      </Drawer>
    </Box>
  );
};

export default WardReports;