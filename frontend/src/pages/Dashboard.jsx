import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Material UI Imports
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

// Icons for the toggle
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";

// Charting Library
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Export Tools
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

// Chart Colors
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF4444"];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Data States
  const [summary, setSummary] = useState(null);
  const [statusWise, setStatusWise] = useState([]);
  const [categoryWise, setCategoryWise] = useState([]);
  const [last30Days, setLast30Days] = useState([]);
  const [complaints, setComplaints] = useState([]);

  // ✅ UI State: Toggle between 'table' and 'chart'
  const [viewMode, setViewMode] = useState("table");

  // AUTH CHECK
  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  // FETCH DATA
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const summaryRes = await api.get("/dashboard/summary");
      const statusRes = await api.get("/dashboard/status-wise");
      const categoryRes = await api.get("/dashboard/category-wise");
      const last30Res = await api.get("/dashboard/last-30-days");
      const complaintsRes = await api.get("/complaints");

      setSummary(summaryRes.data);
      setStatusWise(statusRes.data);
      setCategoryWise(categoryRes.data);
      setLast30Days(last30Res.data);
      setComplaints(complaintsRes.data);
    } catch (error) {
      console.error("Dashboard data fetch failed", error);
    }
  };

  /* =====================
       EXPORT (ADMIN ONLY)
       ===================== */
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Corporator Office Dashboard Report", 14, 15);

    doc.autoTable({
      startY: 25,
      head: [["Metric", "Value"]],
      body: [
        ["Total Complaints", summary.total],
        ["New", summary.new],
        ["In Process", summary.in_process],
        ["Completed", summary.completed],
      ],
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Status", "Count"]],
      body: statusWise.map((s) => [s.status, s.count]),
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Category", "Count"]],
      body: categoryWise.map((c) => [c.category, c.count]),
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Date", "Count"]],
      body: last30Days.map((d) => [
        new Date(d.date).toLocaleDateString(),
        d.count,
      ]),
    });

    doc.save("dashboard-report.pdf");
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([summary]), "Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(statusWise), "Status Wise");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(categoryWise), "Category Wise");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(last30Days), "Last 30 Days");
    XLSX.writeFile(wb, "dashboard-report.xlsx");
  };

  // =========================
  // 📍 AREA-WISE GROUPING
  // =========================
  const areaWiseData = complaints.reduce((acc, c) => {
    const area = c.area || "Unknown";
    if (!acc[area]) {
      acc[area] = { total: 0, NEW: 0, IN_PROCESS: 0, COMPLETED: 0 };
    }
    acc[area].total += 1;
    if (acc[area][c.status] !== undefined) {
      acc[area][c.status] += 1;
    }
    return acc;
  }, {});

  // Transform Area Data for Charts
  const areaChartData = Object.entries(areaWiseData).map(([area, stats]) => ({
    area,
    ...stats,
  }));

  if (!summary) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <Box sx={{ p: 4 }}>
      {/* HEADER & ACTIONS */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Dashboard Overview
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {/* ✅ VIEW TOGGLE BUTTON */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => {
              if (newMode) setViewMode(newMode);
            }}
            size="small"
            color="primary"
          >
            <ToggleButton value="table">
              <TableChartIcon sx={{ mr: 1 }} /> Tables
            </ToggleButton>
            <ToggleButton value="chart">
              <BarChartIcon sx={{ mr: 1 }} /> Charts
            </ToggleButton>
          </ToggleButtonGroup>

          {isAdmin && (
            <>
              <Button variant="outlined" onClick={exportPDF}>
                Export PDF
              </Button>
              <Button variant="contained" onClick={exportExcel}>
                Export Excel
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* SUMMARY CARDS (ALWAYS VISIBLE) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <StatCard title="Total Complaints" value={summary.total} />
        <StatCard title="New" value={summary.new} color="#64748b" />
        <StatCard title="In Process" value={summary.in_process} color="#f59e0b" />
        <StatCard title="Completed" value={summary.completed} color="#16a34a" />
      </Grid>

      {/* =========================
           CONDITIONAL RENDERING
         ========================= */}

      {viewMode === "table" ? (
        /* ✅ ORIGINAL TABLE VIEW */
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <DataSection title="Status-wise Complaints">
                <SimpleTable
                  headers={["Status", "Count"]}
                  rows={statusWise.map((s) => [s.status, s.count])}
                />
              </DataSection>
            </Grid>

            {isAdmin && (
              <Grid item xs={12} md={6}>
                <DataSection title="Category-wise Complaints">
                  <SimpleTable
                    headers={["Category", "Count"]}
                    rows={categoryWise.map((c) => [c.category, c.count])}
                  />
                </DataSection>
              </Grid>
            )}
          </Grid>

          <Box sx={{ mt: 3 }}>
            <DataSection title="Last 30 Days Complaints">
              <SimpleTable
                headers={["Date", "Count"]}
                rows={last30Days.map((d) => [
                  new Date(d.date).toLocaleDateString(),
                  d.count,
                ])}
              />
            </DataSection>
          </Box>

          <Paper sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Area-wise Complaints
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Area</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>New</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>In Process</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Completed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(areaWiseData).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  Object.entries(areaWiseData).map(([area, stats]) => (
                    <TableRow key={area}>
                      <TableCell>{area}</TableCell>
                      <TableCell>{stats.total}</TableCell>
                      <TableCell>{stats.NEW}</TableCell>
                      <TableCell>{stats.IN_PROCESS}</TableCell>
                      <TableCell>{stats.COMPLETED}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </>
      ) : (
        /* ✅ NEW CHART VIEW */
        <>
          <Grid container spacing={3}>
            {/* 1. STATUS CHART */}
            <Grid item xs={12} md={6}>
              <DataSection title="Status Distribution">
                <Box sx={{ height: 300, width: "100%" }}>
                  <ResponsiveContainer>
                    <BarChart data={statusWise}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563eb">
                        {statusWise.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </DataSection>
            </Grid>

            {/* 2. CATEGORY CHART */}
            {isAdmin && (
              <Grid item xs={12} md={6}>
                <DataSection title="Category Distribution">
                  <Box sx={{ height: 300, width: "100%" }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={categoryWise}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="category"
                          label
                        >
                          {categoryWise.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </DataSection>
              </Grid>
            )}
          </Grid>

          {/* 3. TREND CHART */}
          <Box sx={{ mt: 3 }}>
            <DataSection title="Complaints Trend (Last 30 Days)">
              <Box sx={{ height: 300, width: "100%" }}>
                <ResponsiveContainer>
                  <BarChart data={last30Days}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => new Date(val).getDate()} 
                    />
                    <YAxis />
                    <Tooltip labelFormatter={(val) => new Date(val).toLocaleDateString()}/>
                    <Bar dataKey="count" fill="#8884d8" name="Complaints" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </DataSection>
          </Box>
        </>
      )}
    </Box>
  );
};

/* =====================
   UI COMPONENTS
   ===================== */
const StatCard = ({ title, value, color = "#2563eb" }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h4" fontWeight={700} sx={{ color }}>
        {value}
      </Typography>
    </Paper>
  </Grid>
);

const DataSection = ({ title, children }) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: 3,
      boxShadow: "0 12px 40px rgba(0,0,0,0.14)",
    }}
  >
    <Typography fontWeight={600}>{title}</Typography>
    <Divider sx={{ my: 2 }} />
    {children}
  </Paper>
);

const SimpleTable = ({ headers, rows }) => (
  <Table size="small">
    <TableHead>
      <TableRow>
        {headers.map((h, i) => (
          <TableCell key={i} sx={{ fontWeight: 600 }}>
            {h}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
    <TableBody>
      {rows.map((row, i) => (
        <TableRow key={i}>
          {row.map((cell, j) => (
            <TableCell key={j}>{cell}</TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default Dashboard;