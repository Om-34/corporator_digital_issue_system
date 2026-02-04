import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
} from "@mui/material";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [statusWise, setStatusWise] = useState([]);
  const [categoryWise, setCategoryWise] = useState([]);
  const [last30Days, setLast30Days] = useState([]);

  // Redirect if not logged in (LOGIC UNCHANGED)
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch dashboard data (LOGIC UNCHANGED)
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const summaryRes = await api.get("/dashboard/summary");
      const statusRes = await api.get("/dashboard/status-wise");
      const categoryRes = await api.get("/dashboard/category-wise");
      const last30Res = await api.get("/dashboard/last-30-days");

      setSummary(summaryRes.data);
      setStatusWise(statusRes.data);
      setCategoryWise(categoryRes.data);
      setLast30Days(last30Res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to load dashboard data");
    }
  };

  if (!summary) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Dashboard
      </Typography>

      {/* SUMMARY CARDS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <SummaryCard title="Total Complaints" value={summary.total} />
        <SummaryCard title="New" value={summary.new} />
        <SummaryCard title="In Process" value={summary.in_process} />
        <SummaryCard title="Completed" value={summary.completed} />
      </Grid>

      {/* STATUS WISE */}
      <Section title="Status-wise Complaints">
        <SimpleTable
          headers={["Status", "Count"]}
          rows={statusWise.map((s) => [s.status, s.count])}
        />
      </Section>

      {/* CATEGORY WISE */}
      <Section title="Category-wise Complaints">
        <SimpleTable
          headers={["Category", "Count"]}
          rows={categoryWise.map((c) => [c.category, c.count])}
        />
      </Section>

      {/* LAST 30 DAYS */}
      <Section title="Last 30 Days Complaints">
        <SimpleTable
          headers={["Date", "Count"]}
          rows={last30Days.map((d) => [
            new Date(d.date).toLocaleDateString(),
            d.count,
          ])}
        />
      </Section>
    </Box>
  );
};

/* =====================
   REUSABLE UI COMPONENTS
   ===================== */

const SummaryCard = ({ title, value }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Paper sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h5">{value}</Typography>
    </Paper>
  </Grid>
);

const Section = ({ title, children }) => (
  <Paper sx={{ p: 2, mb: 3 }}>
    <Typography variant="subtitle1" sx={{ mb: 1 }}>
      {title}
    </Typography>
    {children}
  </Paper>
);

const SimpleTable = ({ headers, rows }) => (
  <Table size="small">
    <TableHead>
      <TableRow>
        {headers.map((h, i) => (
          <TableCell key={i}>{h}</TableCell>
        ))}
      </TableRow>
    </TableHead>
    <TableBody>
      {rows.length === 0 ? (
        <TableRow>
          <TableCell colSpan={headers.length} align="center">
            No data available
          </TableCell>
        </TableRow>
      ) : (
        rows.map((row, i) => (
          <TableRow key={i}>
            {row.map((cell, j) => (
              <TableCell key={j}>{cell}</TableCell>
            ))}
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
);

export default Dashboard;
