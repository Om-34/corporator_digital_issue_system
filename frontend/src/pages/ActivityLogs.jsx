import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
  TablePagination,
  CircularProgress
} from "@mui/material";

const ActivityLogs = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

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

  // 🛡️ ROLE GUARD
  useEffect(() => {
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/activity/logs");
      setLogs(res.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // 🧠 SMART FILTER LOGIC
  // ============================
  const filteredLogs = logs.filter((log) => {
    // 🛡️ Null-safe search string construction
    const initiator = (log.initiator_name || log.user_name || "").toLowerCase();
    const details = (log.details || "").toLowerCase();
    const office = (log.office_name || "").toLowerCase();
    const searchTerm = search.toLowerCase();

    const searchMatch = 
      initiator.includes(searchTerm) || 
      details.includes(searchTerm) || 
      office.includes(searchTerm);

    const actionMatch = actionFilter === "ALL" ? true : log.action === actionFilter;

    const logDate = new Date(log.created_at);
    const startDate = fromDate ? new Date(fromDate) : null;
    const endDate = toDate ? new Date(toDate) : null;
    if (endDate) endDate.setHours(23, 59, 59, 999);

    const dateMatch =
      (!startDate || logDate >= startDate) &&
      (!endDate || logDate <= endDate);

    return searchMatch && actionMatch && dateMatch;
  });

  const paginatedLogs = filteredLogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const uniqueActions = [...new Set(logs.map(log => log.action))];

  const clearFilters = () => {
    setSearch("");
    setActionFilter("ALL");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  const getActionColor = (action) => {
    switch (action) {
      case "LOGIN": return "primary";
      case "NEW COMPLAINT": return "success";
      case "STATUS UPDATE": return "warning";
      case "REGISTRATION": return "secondary";
      case "OFFICE_ONBOARDING": return "info";
      default: return "default";
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} color="textSecondary">Fetching audit trails...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: "auto" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          {user.role === 'SUPER_ADMIN' ? 'Global Activity Audit' : 'Office Audit Logs'}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {user.role === 'SUPER_ADMIN' 
            ? 'Monitor activities across all corporator offices in the system.' 
            : 'Monitor all system activities and staff interactions within your ward office.'}
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={700}>Search & Filters</Typography>
          <Button variant="text" size="small" onClick={clearFilters} sx={{ textTransform: "none" }}>
            Reset Filters
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 1 }}>
          <TextField
            label="Search User, Office or Details"
            size="small"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ flexGrow: 1, minWidth: 250 }}
          />

          <TextField
            select
            label="Action Type"
            size="small"
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="ALL">All Actions</MenuItem>
            {uniqueActions.map((action) => (
              <MenuItem key={action} value={action}>{action}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="From"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setPage(0); }}
          />
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              <TableCell sx={{ fontWeight: 700 }}>Initiated By</TableCell>
              {user.role === 'SUPER_ADMIN' && (
                <TableCell sx={{ fontWeight: 700 }}>Ward Office</TableCell>
              )}
              <TableCell sx={{ fontWeight: 700 }}>Activity</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={user.role === 'SUPER_ADMIN' ? 5 : 4} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  No activity matching these criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {log.initiator_name || log.user_name || "Unknown User"}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ fontFamily: "monospace" }}>
                      ID: {log.user_id ? log.user_id.substring(0, 8) : "—"}
                    </Typography>
                  </TableCell>
                  
                  {user.role === 'SUPER_ADMIN' && (
                    <TableCell>
                      <Typography variant="body2" color="primary" fontWeight={500}>
                        {log.office_name || "System/Master"}
                      </Typography>
                    </TableCell>
                  )}

                  <TableCell>
                    <Chip 
                      label={log.action} 
                      size="small" 
                      color={getActionColor(log.action)} 
                      variant="filled" 
                      sx={{ fontSize: "0.65rem", fontWeight: 800 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.875rem" }}>{log.details || "—"}</TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

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