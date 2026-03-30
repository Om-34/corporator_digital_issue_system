import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Chip,
  Grid,
  CircularProgress,
} from "@mui/material";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import PostAddRoundedIcon from "@mui/icons-material/PostAddRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const Reasons = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [reasons, setReasons] = useState([]);
  const [reasonName, setReasonName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchReasons();
  }, []);

  const fetchReasons = async () => {
    try {
      setLoading(true);
      // Backend automatically filters by Admin's office_id via token
      const res = await api.get("/reasons");
      setReasons(res.data);
    } catch (error) {
      console.error("Failed to fetch reasons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReason = async (e) => {
    e.preventDefault();

    if (!reasonName.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      // Backend assigns office_id automatically
      await api.post("/reasons", { reasonName });
      setReasonName("");
      fetchReasons();
      alert("Category added successfully! ✅");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create category");
    }
  };

  const deactivateReason = async (id) => {
    try {
      await api.patch(`/reasons/${id}/deactivate`);
      fetchReasons();
    } catch (error) {
      alert("Failed to deactivate category");
    }
  };

  const activateReason = async (id) => {
    try {
      await api.patch(`/reasons/${id}/activate`);
      fetchReasons();
    } catch (error) {
      alert("Failed to activate category");
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", py: 4, px: 2 }}>
      {/* PAGE HEADER */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b", mb: 1 }}>
          Issue Categories
        </Typography>
        <Typography sx={{ color: "#64748b" }}>
          Configure the types of grievances citizens can report for your ward.
        </Typography>
      </Box>

      {/* CREATE CATEGORY ACTION CARD */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          border: "1px solid #e2e8f0",
          bgcolor: "#fff",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <PostAddRoundedIcon sx={{ color: "#6366f1" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#334155" }}>
            Add New Category
          </Typography>
        </Box>

        <form onSubmit={handleCreateReason}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={9}>
              <TextField
                fullWidth
                size="small"
                placeholder="Category Name (e.g. Drainage, Road Safety, Garbage)"
                value={reasonName}
                onChange={(e) => setReasonName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disableElevation
                sx={{ 
                  height: 40, 
                  bgcolor: "#1e293b", 
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#334155" } 
                }}
              >
                Add Category
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* CATEGORIES LIST TABLE */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 1 }}>
          <CategoryRoundedIcon sx={{ color: "#6366f1" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#334155" }}>
            Ward Specific Categories
          </Typography>
        </Box>
        <Divider />
        
        {loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Category Name</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: "#475569" }}>Current Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: "#475569", pr: 4 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reasons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    No categories found. Add your first category above.
                  </TableCell>
                </TableRow>
              ) : (
                reasons.map((r) => (
                  <TableRow key={r.id} hover sx={{ "& td": { py: 2 } }}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: "#1e293b" }}>
                        {r.reason_name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={r.is_active ? "Active" : "Inactive"}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          bgcolor: r.is_active ? "#dcfce7" : "#f1f5f9",
                          color: r.is_active ? "#166534" : "#475569",
                          border: "1px solid",
                          borderColor: r.is_active ? "#bbf7d0" : "#e2e8f0",
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}>
                      {r.is_active ? (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          startIcon={<BlockRoundedIcon />}
                          onClick={() => deactivateReason(r.id)}
                          sx={{ 
                            borderRadius: 2, 
                            fontSize: "0.75rem", 
                            fontWeight: 700,
                            textTransform: "none"
                          }}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          color="success"
                          variant="outlined"
                          startIcon={<CheckCircleRoundedIcon />}
                          onClick={() => activateReason(r.id)}
                          sx={{ 
                            borderRadius: 2, 
                            fontSize: "0.75rem", 
                            fontWeight: 700,
                            textTransform: "none"
                          }}
                        >
                          Activate
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
};

export default Reasons;