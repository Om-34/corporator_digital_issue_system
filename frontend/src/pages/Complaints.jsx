import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Box,
  Chip,
  TextField,
  MenuItem,
  TablePagination,
} from "@mui/material";

const Complaints = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI-only filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Pagination (UI ONLY)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Redirect if not logged in (LOGIC UNCHANGED)
  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  // Fetch complaints (LOGIC UNCHANGED)
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get("/complaints");
      setComplaints(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 FILTERING (DERIVED DATA ONLY)
  const filteredComplaints = complaints.filter((c) => {
    const searchMatch =
      c.person_name.toLowerCase().includes(search.toLowerCase()) ||
      c.issue_no.toLowerCase().includes(search.toLowerCase());

    const statusMatch = statusFilter ? c.status === statusFilter : true;
    const categoryMatch = categoryFilter
      ? c.reason_name === categoryFilter
      : true;

    return searchMatch && statusMatch && categoryMatch;
  });

  // 📄 PAGINATED DATA (DERIVED)
  const paginatedComplaints = filteredComplaints.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const categories = [
    ...new Set(complaints.map((c) => c.reason_name)),
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading complaints...</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Complaints</Typography>

        <Button
          variant="contained"
          onClick={() => navigate("/complaints/new")}
        >
          + New Complaint
        </Button>
      </Box>

      {/* 🔍 FILTER BAR */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="Search (Name / Issue No)"
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />

        <TextField
          select
          label="Status"
          size="small"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="NEW">NEW</MenuItem>
          <MenuItem value="IN_PROCESS">IN PROCESS</MenuItem>
          <MenuItem value="COMPLETED">COMPLETED</MenuItem>
        </TextField>

        <TextField
          select
          label="Category"
          size="small"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* 📋 TABLE */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Issue No</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Person</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Written By</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {paginatedComplaints.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No matching complaints
              </TableCell>
            </TableRow>
          ) : (
            paginatedComplaints.map((c) => (
              <TableRow
                key={c.id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => navigate(`/complaints/${c.id}`)}
              >
                <TableCell>{c.issue_no}</TableCell>
                <TableCell>
                  {new Date(c.complaint_date).toLocaleDateString()}
                </TableCell>
                <TableCell>{c.person_name}</TableCell>
                <TableCell>{c.reason_name}</TableCell>
                <TableCell>
                  <StatusChip status={c.status} />
                </TableCell>
                <TableCell>{c.written_by}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* 📄 PAGINATION CONTROLS */}
      <TablePagination
        component="div"
        count={filteredComplaints.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 20, 50]}
      />
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

export default Complaints;
