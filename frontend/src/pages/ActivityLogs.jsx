import { useEffect, useState } from "react";
import api from "../api/axios";

// Material UI Imports
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  TextField,
  MenuItem,
  Button,
  Chip,
  TablePagination
} from "@mui/material";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔍 FILTER STATES
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch logs when page loads
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get("/activity/logs");
      setLogs(res.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
      alert("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // 🧠 SMART FILTER LOGIC
  // ============================
  const filteredLogs = logs.filter((log) => {
    // 1. Search by Name or Details
    const searchMatch = 
      log.user_name.toLowerCase().includes(search.toLowerCase()) || 
      (log.details && log.details.toLowerCase().includes(search.toLowerCase()));

    // 2. Filter by Action (e.g., Only show LOGINs)
    const actionMatch = actionFilter === "ALL" ? true : log.action === actionFilter;

    // 3. Date Range Filter
    const logDate = new Date(log.created_at);
    const startDate = fromDate ? new Date(fromDate) : null;
    const endDate = toDate ? new Date(toDate) : null;

    // Adjust endDate to include the full day
    if (endDate) endDate.setHours(23, 59, 59, 999);

    const dateMatch =
      (!startDate || logDate >= startDate) &&
      (!endDate || logDate <= endDate);

    return searchMatch && actionMatch && dateMatch;
  });

  // Pagination Logic
  const paginatedLogs = filteredLogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Get unique Actions for Dropdown (e.g. LOGIN, NEW COMPLAINT)
  const uniqueActions = [...new Set(logs.map(log => log.action))];

  // ============================
  // RESET FILTERS
  // ============================
  const clearFilters = () => {
    setSearch("");
    setActionFilter("ALL");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading logs...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">User Activity Logs</Typography>
          <Button variant="outlined" size="small" onClick={clearFilters}>
            Clear Filters
          </Button>
        </Box>

        {/* 🔍 FILTER BAR */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
          {/* SEARCH */}
          <TextField
            label="Search User or Details"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 200 }}
          />

          {/* ACTION DROPDOWN */}
          <TextField
            select
            label="Action Type"
            size="small"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="ALL">All Actions</MenuItem>
            {uniqueActions.map((action) => (
              <MenuItem key={action} value={action}>{action}</MenuItem>
            ))}
          </TextField>

          {/* DATE PICKERS */}
          <TextField
            label="From Date"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <TextField
            label="To Date"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </Box>

        {/* 📋 TABLE */}
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              <TableCell><strong>User</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
              <TableCell><strong>Details</strong></TableCell>
              <TableCell><strong>Date & Time</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3, color: "gray" }}>
                  No logs found for these filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {log.user_name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      ID: {log.user_id ? log.user_id.substring(0,6) : ""}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={log.action} 
                      size="small" 
                      color={log.action === "LOGIN" ? "primary" : "default"} 
                      variant="outlined" 
                    />
                  </TableCell>
                  <TableCell>{log.details || "-"}</TableCell>
                  <TableCell>
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        <TablePagination
          component="div"
          count={filteredLogs.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>
    </Box>
  );
};

export default ActivityLogs;