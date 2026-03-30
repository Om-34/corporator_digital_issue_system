import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client"; 

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
  Avatar,
  CircularProgress,
} from "@mui/material";

import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import FiberNewRoundedIcon from "@mui/icons-material/FiberNewRounded";

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
  AreaChart,
  Area,
} from "recharts";

import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#0ea5e9"];

// Initialize socket outside component
const socket = io("http://localhost:5000");

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [statusWise, setStatusWise] = useState([]);
  const [categoryWise, setCategoryWise] = useState([]);
  const [last30Days, setLast30Days] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [loading, setLoading] = useState(true); // ✅ Added to prevent white screen

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // ==========================================
  // ⚡ REAL-TIME DASHBOARD UPDATES
  // ==========================================
  useEffect(() => {
    // ✅ Master Guard: Only join room if officeId exists
    if (user?.officeId) {
      socket.emit("join_office", user.officeId);

      socket.on("new_complaint_alert", (data) => {
        setSummary((prev) => (prev ? {
          ...prev,
          total: (prev.total || 0) + 1,
          new: (prev.new || 0) + 1
        } : prev));

        setStatusWise((prev) => 
          prev.map((s) => 
            s.status === "NEW" ? { ...s, count: parseInt(s.count || 0) + 1 } : s
          )
        );

        const today = new Date().toISOString().split('T')[0];
        setLast30Days((prev) => {
          const exists = prev.find(d => d.date.split('T')[0] === today);
          if (exists) {
            return prev.map(d => d.date.split('T')[0] === today ? { ...d, count: parseInt(d.count || 0) + 1 } : d);
          }
          return [...prev, { date: today, count: 1 }];
        });
      });
    }

    return () => {
      socket.off("new_complaint_alert");
    };
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // ✅ Using Promise.allSettled so if one fails (like for Master Admin), others continue
      const results = await Promise.allSettled([
        api.get("/dashboard/summary"),
        api.get("/dashboard/status-wise"),
        api.get("/dashboard/category-wise"),
        api.get("/dashboard/last-30-days"),
        api.get("/complaints")
      ]);

      setSummary(results[0].status === 'fulfilled' ? results[0].value.data : { total: 0, new: 0, in_process: 0, completed: 0 });
      setStatusWise(results[1].status === 'fulfilled' ? results[1].value.data : []);
      setCategoryWise(results[2].status === 'fulfilled' ? results[2].value.data : []);
      setLast30Days(results[3].status === 'fulfilled' ? results[3].value.data : []);
      setComplaints(results[4].status === 'fulfilled' ? results[4].value.data : []);
    } catch (error) {
      console.error("Dashboard data fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`${user?.role === 'USER' ? 'My' : 'Office'} Dashboard Report`, 14, 15);

    doc.autoTable({
      startY: 25,
      head: [["Metric", "Value"]],
      body: [
        ["Total Complaints", summary?.total || 0],
        ["New", summary?.new || 0],
        ["In Process", summary?.in_process || 0],
        ["Completed", summary?.completed || 0],
      ],
    });

    doc.autoTable({
      startY: (doc).lastAutoTable.finalY + 10,
      head: [["Status", "Count"]],
      body: statusWise.map((s) => [s.status, s.count]),
    });

    doc.save("dashboard-report.pdf");
  };

  const exportOfficialExcel = () => {
    const wb = XLSX.utils.book_new();
    const dateStamp = new Date().toLocaleDateString();

    const resolutionRate = (summary?.total > 0) 
      ? ((summary.completed / summary.total) * 100).toFixed(1) 
      : "0";

    const execSummary = [
      ["OFFICIAL CONSTITUENCY GRIEVANCE REPORT"],
      ["Report Generated On:", dateStamp],
      ["Office Entity:", "Office of the Corporator - Digital Desk"],
      [],
      ["KEY PERFORMANCE INDICATORS (KPI)"],
      ["Description", "Value", "Official Status"],
      ["Total Complaint Load", summary?.total || 0, "TOTAL LOAD"],
      ["Unattended Requests", summary?.new || 0, "NEW"],
      ["Active Investigations", summary?.in_process || 0, "IN PROCESS"],
      ["Resolved Issues", summary?.completed || 0, "COMPLETED"],
      ["Overall Resolution Efficiency", `${resolutionRate}%`, "PERFORMANCE"],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(execSummary);

    const areaHeader = [["Area Name", "Total Cases", "New", "In-Progress", "Completed", "Efficiency %"]];
    const areaRows = Object.entries(areaWiseData).map(([area, stats]) => [
      area.toUpperCase(), stats.total, stats.NEW, stats.IN_PROCESS, stats.COMPLETED,
      stats.total > 0 ? `${((stats.COMPLETED / stats.total) * 100).toFixed(1)}%` : "0%"
    ]);
    const wsArea = XLSX.utils.aoa_to_sheet([...areaHeader, ...areaRows]);

    const wsDetailed = XLSX.utils.json_to_sheet(complaints.map((c, i) => ({
      "Sr. No.": i + 1,
      "Log Date": new Date(c.complaint_date).toLocaleDateString(),
      "Area": c.area || "General",
      "Category": c.reason_name ? c.reason_name.toUpperCase() : "N/A",
      "Status": c.status,
      "Description": c.description || "N/A"
    })));

    XLSX.utils.book_append_sheet(wb, wsSummary, "Executive Summary");
    XLSX.utils.book_append_sheet(wb, wsArea, "Ward Performance");
    XLSX.utils.book_append_sheet(wb, wsDetailed, "Official Audit Log");

    XLSX.writeFile(wb, `Constituency_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

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

  // ✅ PREVENT WHITE SCREEN: Loading or missing summary guard
  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">Initializing System...</Typography>
      </Box>
    );
  }

  const isStaff = user?.role === "ADMIN" || user?.role === "OPERATOR";
  const isMaster = user?.role === "SUPER_ADMIN";

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      
      {/* HEADER SECTION */}
      <Paper
        elevation={0}
        sx={{
          p: 3, mb: 4, borderRadius: 4, border: "1px solid rgba(255,255,255,0.3)",
          background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 2, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)"
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: "#1e293b", letterSpacing: "-0.02em" }}>
            {isMaster ? "Global Control Center" : user?.role === "USER" ? "My Activity" : "Dashboard Overview"}
          </Typography>
          <Typography sx={{ color: "#64748b", fontWeight: 500 }}>
            {isMaster ? "Administering all Ward Offices" : user?.role === "USER" ? "Track your personal grievance history" : "Corporator Office Analytics & Performance Summary"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
            sx={{ bgcolor: "#fff", border: "1px solid #e2e8f0" }}
          >
            <ToggleButton value="table" sx={{ px: 2 }}>
              <TableChartIcon sx={{ mr: 1, fontSize: 18 }} /> Tables
            </ToggleButton>
            <ToggleButton value="chart" sx={{ px: 2 }}>
              <BarChartIcon sx={{ mr: 1, fontSize: 18 }} /> Charts
            </ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" onClick={exportPDF} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: "#e2e8f0", color: "#475569" }}>
              Export PDF
            </Button>
            {isStaff && (
              <Button variant="contained" disableElevation onClick={exportOfficialExcel} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: "#1e293b", "&:hover": { bgcolor: "#334155" } }}>
                Official Excel Report
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* KPI SUMMARY CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <StatCard title={user?.role === 'USER' ? "My Total" : "Total Complaints"} value={summary?.total || 0} icon={<AssignmentRoundedIcon />} color="#6366f1" />
        <StatCard title="New" value={summary?.new || 0} icon={<FiberNewRoundedIcon />} color="#0ea5e9" />
        <StatCard title="In Process" value={summary?.in_process || 0} icon={<PendingActionsRoundedIcon />} color="#f59e0b" />
        <StatCard title="Completed" value={summary?.completed || 0} icon={<CheckCircleRoundedIcon />} color="#10b981" />
      </Grid>

      {viewMode === "table" ? (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <DataSection title="Status-wise Summary">
                <SimpleTable
                  headers={["Status", "Count"]}
                  rows={statusWise.map((s) => [
                    <Box key={s.status} component="span" sx={{ 
                        px: 1.5, py: 0.5, borderRadius: 1, fontSize: '0.75rem', fontWeight: 700,
                        bgcolor: s.status === 'COMPLETED' ? '#dcfce7' : s.status === 'IN_PROCESS' ? '#fef3c7' : '#f1f5f9',
                        color: s.status === 'COMPLETED' ? '#166534' : s.status === 'IN_PROCESS' ? '#92400e' : '#475569'
                    }}>{s.status}</Box>, 
                    s.count
                  ])}
                />
              </DataSection>
            </Grid>

            {isStaff && (
              <Grid item xs={12} md={6}>
                <DataSection title="Category-wise Distribution">
                  <SimpleTable
                    headers={["Category", "Count"]}
                    rows={categoryWise.map((c) => [c.category, <b key={c.category}>{c.count}</b>])}
                  />
                </DataSection>
              </Grid>
            )}
          </Grid>

          <Box sx={{ mt: 3 }}>
            <DataSection title={user?.role === 'USER' ? "My Submission Trend" : "Last 30 Days Trend"}>
              <SimpleTable
                headers={["Date", "Count"]}
                rows={last30Days.map((d) => [
                  new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                  d.count,
                ])}
              />
            </DataSection>
          </Box>

          {isStaff && (
            <DataSection title="Area-wise Detailed Performance" sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Area</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#0ea5e9" }}>New</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#f59e0b" }}>In Process</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#10b981" }}>Completed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(areaWiseData).map(([area, stats]) => (
                    <TableRow key={area} hover sx={{ '& td': { py: 2 } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{area}</TableCell>
                      <TableCell>{stats.total}</TableCell>
                      <TableCell>{stats.NEW}</TableCell>
                      <TableCell>{stats.IN_PROCESS}</TableCell>
                      <TableCell>{stats.COMPLETED}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DataSection>
          )}
        </>
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <DataSection title="Status Analysis">
                <Box sx={{ height: 320, mt: 2 }}>
                  <ResponsiveContainer>
                    <BarChart data={statusWise} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                      <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </DataSection>
            </Grid>

            {isStaff && (
              <Grid item xs={12} md={6}>
                <DataSection title="Category Load">
                  <Box sx={{ height: 320, mt: 2 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={categoryWise} dataKey="count" nameKey="category" innerRadius={60} outerRadius={90} paddingAngle={5}>
                          {categoryWise.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </DataSection>
              </Grid>
            )}
          </Grid>

          <Box sx={{ mt: 3 }}>
            <DataSection title="Submission Trend">
              <Box sx={{ height: 320, mt: 2 }}>
                <ResponsiveContainer>
                  <AreaChart data={last30Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tickFormatter={(val) => new Date(val).getDate()} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip labelFormatter={(val) => new Date(val).toLocaleDateString()} />
                    <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </DataSection>
          </Box>
        </>
      )}
    </Box>
  );
};

/* REFINED UI COMPONENTS (Original Logic) */

const StatCard = ({ title, value, icon, color }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Paper
      elevation={0}
      sx={{
        p: 3, borderRadius: 4, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 2,
        transition: "transform 0.2s ease-in-out", "&:hover": { transform: "translateY(-4px)", borderColor: color, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" },
      }}
    >
      <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 48, height: 48, borderRadius: 2 }}>
        {icon || <AssessmentIcon />}
      </Avatar>
      <Box>
        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ color: "#1e293b" }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  </Grid>
);

const DataSection = ({ title, children, sx }) => (
  <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid #e2e8f0", background: "#ffffff", ...sx }}>
    <Typography variant="h6" fontWeight={700} sx={{ color: "#1e293b", mb: 1 }}>{title}</Typography>
    <Divider sx={{ mb: 2, borderColor: "#f1f5f9" }} />
    {children}
  </Paper>
);

const SimpleTable = ({ headers, rows }) => (
  <Table size="small">
    <TableHead>
      <TableRow>
        {headers.map((h, i) => (
          <TableCell key={i} sx={{ fontWeight: 700, color: "#64748b", borderBottom: "2px solid #f1f5f9", py: 1.5 }}>{h}</TableCell>
        ))}
      </TableRow>
    </TableHead>
    <TableBody>
      {rows.map((row, i) => (
        <TableRow key={i} hover sx={{ '& td': { borderBottom: "1px solid #f1f5f9", py: 1.5 } }}>
          {row.map((cell, j) => <TableCell key={j} sx={{ color: "#1e293b" }}>{cell}</TableCell>)}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default Dashboard;