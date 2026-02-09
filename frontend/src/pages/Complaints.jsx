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

// ✅ PDF EXPORT TOOLS
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ✅ EXCEL EXPORT TOOLS
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Complaints = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI-only filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  
  // Date range filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  // Fetch complaints
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get("/complaints");
      setComplaints(res.data);
    } catch (error) {
      alert("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 FILTERING LOGIC
  const filteredComplaints = complaints.filter((c) => {
    const searchMatch =
      c.person_name.toLowerCase().includes(search.toLowerCase()) ||
      c.issue_no.toLowerCase().includes(search.toLowerCase());

    const statusMatch = statusFilter ? c.status === statusFilter : true;
    const categoryMatch = categoryFilter
      ? c.reason_name === categoryFilter
      : true;
    const areaMatch = areaFilter ? c.area === areaFilter : true;

    // Date Logic
    let fromMatch = true;
    let toMatch = true;

    if (fromDate || toDate) {
      const cDate = new Date(c.complaint_date);
      const complaintMidnight = new Date(
        cDate.getFullYear(),
        cDate.getMonth(),
        cDate.getDate()
      ).getTime();

      if (fromDate) {
        const [y, m, d] = fromDate.split("-").map(Number);
        const fromMidnight = new Date(y, m - 1, d).getTime();
        fromMatch = complaintMidnight >= fromMidnight;
      }

      if (toDate) {
        const [y, m, d] = toDate.split("-").map(Number);
        const toMidnight = new Date(y, m - 1, d).getTime();
        toMatch = complaintMidnight <= toMidnight;
      }
    }

    return (
      searchMatch &&
      statusMatch &&
      categoryMatch &&
      areaMatch &&
      fromMatch &&
      toMatch
    );
  });

  // =========================
  // DASHBOARD COUNTERS
  // =========================
  const totalCount = filteredComplaints.length;
  const newCount = filteredComplaints.filter((c) => c.status === "NEW").length;
  const inProcessCount = filteredComplaints.filter(
    (c) => c.status === "IN_PROCESS"
  ).length;
  const completedCount = filteredComplaints.filter(
    (c) => c.status === "COMPLETED"
  ).length;

  // Pagination Logic
  const paginatedComplaints = filteredComplaints.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Dropdown Options
  const categories = [...new Set(complaints.map((c) => c.reason_name))];
  const areas = [...new Set(complaints.map((c) => c.area).filter(Boolean))];

  // ==========================================
  // 🖨️ 1. BULK DOWNLOAD JOB CARDS (NEW)
  // ==========================================
  const downloadAllJobCards = () => {
    // 🛑 Safety Check
    if (filteredComplaints.length === 0) {
      alert("No complaints found for selected filters");
      return;
    }

    try {
      const doc = new jsPDF("p", "mm", "a4");

      filteredComplaints.forEach((c, index) => {
        // Add new page for every complaint except the first one
        if (index > 0) {
          doc.addPage();
        }

        // --- HEADER ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("CORPORATOR OFFICE", 105, 15, { align: "center" });

        doc.setFontSize(14);
        doc.text("WORK ORDER / JOB CARD", 105, 24, { align: "center" });

        doc.setLineWidth(0.5);
        doc.line(15, 28, 195, 28);

        // --- ISSUE INFO ---
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`Issue No: ${c.issue_no}`, 15, 36);
        doc.text(
          `Date: ${new Date(c.complaint_date).toLocaleDateString()}`,
          150,
          36
        );

        doc.setFont("helvetica", "bold");
        doc.text(`Status: ${c.status}`, 15, 44);

        // --- DETAILS TABLE ---
        autoTable(doc, {
          startY: 50,
          head: [["Field", "Details"]],
          body: [
            ["Complainant Name", c.person_name],
            ["Contact", c.contact || "-"],
            ["Ward / Area", `${c.ward_no || "-"} / ${c.area || "-"}`],
            ["Address", c.address || "-"],
            ["Category", c.reason_name],
          ],
          styles: { fontSize: 11 },
          headStyles: { fillColor: [25, 118, 210], textColor: 255 },
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 55 },
            1: { cellWidth: 120 },
          },
        });

        // --- DESCRIPTION ---
        let y = doc.lastAutoTable.finalY + 10;
        doc.setFont("helvetica", "bold");
        doc.text("Detailed Complaint:", 15, y);

        doc.setFont("helvetica", "normal");
        const desc = doc.splitTextToSize(
          c.description || "No description",
          170
        );
        doc.text(desc, 15, y + 8);

        // --- SIGNATURES ---
        const signY = 260;
        doc.line(15, signY, 80, signY);
        doc.text("Worker Signature", 15, signY + 6);

        doc.line(120, signY, 190, signY);
        doc.text("Office Signature", 120, signY + 6);

        // --- FOOTER ---
        doc.setFontSize(9);
        doc.text(
          "System-generated document",
          105,
          285,
          { align: "center" }
        );
      });

      doc.save(`Job_Cards_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF");
    }
  };

  // =========================
  // 📄 2. EXPORT LIST PDF
  // =========================
  const exportToPDF = () => {
    try {
      const doc = new jsPDF("l", "pt", "a4");

      doc.setFontSize(18);
      doc.text("Complaints Report", 40, 40);

      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 60);

      autoTable(doc, {
        startY: 80,
        head: [
          [
            "Issue No",
            "Date",
            "Person",
            "Area",
            "Category",
            "Status",
            "Written By",
          ],
        ],
        body: filteredComplaints.map((c) => [
          c.issue_no,
          new Date(c.complaint_date).toLocaleDateString(),
          c.person_name,
          c.area || "-",
          c.reason_name,
          c.status,
          c.written_by,
        ]),
        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: { fillColor: [25, 118, 210], textColor: 255 },
      });

      doc.save("complaints_list.pdf");
    } catch (err) {
      console.error("PDF export failed", err);
      alert("Failed to export PDF");
    }
  };

  // =========================
  // 📊 3. EXPORT EXCEL
  // =========================
  const exportToExcel = () => {
    const data = filteredComplaints.map((c) => ({
      "Issue No": c.issue_no,
      "Complaint Date": new Date(c.complaint_date).toLocaleDateString(),
      "Person Name": c.person_name,
      Contact: c.contact,
      Gender: c.gender,
      "Ward No": c.ward_no || "",
      Area: c.area || "",
      Address: c.address,
      Category: c.reason_name,
      Description: c.description,
      Status: c.status,
      "Written By": c.written_by,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Complaints");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `complaints_${Date.now()}.xlsx`);
  };

  // =========================
  // DATE HELPERS
  // =========================
  const formatDateForInput = (date) => {
    const offset = date.getTimezoneOffset();
    const d = new Date(date.getTime() - offset * 60 * 1000);
    return d.toISOString().split("T")[0];
  };

  const setToday = () => {
    const todayStr = formatDateForInput(new Date());
    setFromDate(todayStr);
    setToDate(todayStr);
    setPage(0);
  };

  const setLast7Days = () => {
    const today = new Date();
    const last7 = new Date();
    last7.setDate(today.getDate() - 6);
    setFromDate(formatDateForInput(last7));
    setToDate(formatDateForInput(today));
    setPage(0);
  };

  const setThisMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setFromDate(formatDateForInput(firstDay));
    setToDate(formatDateForInput(lastDay));
    setPage(0);
  };

  const clearDates = () => {
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading complaints...</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Complaints</Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {/* ✅ NEW: DOWNLOAD JOB CARDS BUTTON */}
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={downloadAllJobCards}
            sx={{ fontWeight: "bold", border: "2px solid" }}
          >
            Download Job Cards
          </Button>

          <Button variant="outlined" onClick={exportToPDF}>
            Export List PDF
          </Button>

          <Button variant="outlined" onClick={exportToExcel}>
            Export Excel
          </Button>

          <Button
            variant="contained"
            onClick={() => navigate("/complaints/new")}
          >
            + New Complaint
          </Button>
        </Box>
      </Box>

      {/* DASHBOARD COUNTERS */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 2,
          mb: 3,
        }}
      >
        <Paper sx={{ p: 2, bgcolor: "#f8fafc" }} elevation={0} variant="outlined">
          <Typography variant="body2" color="textSecondary">
            Total Complaints
          </Typography>
          <Typography variant="h5" fontWeight={600} color="primary">
            {totalCount}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, bgcolor: "#f8fafc" }} elevation={0} variant="outlined">
          <Typography variant="body2" color="textSecondary">
            New
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {newCount}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, bgcolor: "#fff7ed" }} elevation={0} variant="outlined">
          <Typography variant="body2" color="textSecondary">
            In Process
          </Typography>
          <Typography variant="h5" fontWeight={600} color="warning.main">
            {inProcessCount}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, bgcolor: "#f0fdf4" }} elevation={0} variant="outlined">
          <Typography variant="body2" color="textSecondary">
            Completed
          </Typography>
          <Typography variant="h5" fontWeight={600} color="success.main">
            {completedCount}
          </Typography>
        </Paper>
      </Box>

      {/* FILTERS */}
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
          label="From Date"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            setPage(0);
          }}
        />

        <TextField
          label="To Date"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value);
            setPage(0);
          }}
        />

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button size="small" variant="outlined" onClick={setToday}>
            Today
          </Button>
          <Button size="small" variant="outlined" onClick={setLast7Days}>
            Last 7 Days
          </Button>
          <Button size="small" variant="outlined" onClick={setThisMonth}>
            This Month
          </Button>
          <Button size="small" color="error" variant="outlined" onClick={clearDates}>
            Clear
          </Button>
        </Box>

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

        <TextField
          select
          label="Area"
          size="small"
          value={areaFilter}
          onChange={(e) => {
            setAreaFilter(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {areas.map((area) => (
            <MenuItem key={area} value={area}>
              {area}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* TABLE */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Issue No</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Person</TableCell>
            <TableCell>Area</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Written By</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {paginatedComplaints.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
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
                <TableCell>{c.area || "-"}</TableCell>
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

      {/* PAGINATION */}
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