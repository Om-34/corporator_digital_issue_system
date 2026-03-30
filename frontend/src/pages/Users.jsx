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
  Avatar,
  Chip,
  Grid,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";

const Users = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("OPERATOR"); // Default to Operator for staff creation

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Backend automatically filters by Admin's office_id
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Fetch users failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!name || !phone || !password) {
      alert("Name, Phone, and Password are required");
      return;
    }

    try {
      // Backend will automatically assign the Admin's office_id to this new user
      await api.post("/users", { name, phone, password, role });
      alert(`${role} account created successfully! ✅`);

      // Reset form
      setName("");
      setPhone("");
      setPassword("");
      setRole("OPERATOR");
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create user");
    }
  };

  // Separate staff from citizens for the UI view
  const staffMembers = users.filter(u => u.role === "ADMIN" || u.role === "OPERATOR");
  const citizenCount = users.filter(u => u.role === "USER").length;

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", py: 4, px: 2 }}>
      {/* PAGE HEADER */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b", mb: 1 }}>
            User Management
          </Typography>
          <Typography sx={{ color: "#64748b" }}>
            Manage staff roles and monitor citizen registrations for your ward.
          </Typography>
        </Box>
        <Paper variant="outlined" sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: "#f8fafc" }}>
          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>REGISTERED CITIZENS</Typography>
          <Typography variant="h6" sx={{ color: "#6366f1", fontWeight: 800 }}>{citizenCount}</Typography>
        </Paper>
      </Box>

      {/* CREATE USER ACTION CARD */}
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
          <PersonAddAlt1RoundedIcon sx={{ color: "#6366f1" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#334155" }}>
            Add Office Staff
          </Typography>
        </Box>

        <form onSubmit={handleCreateUser}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth size="small" placeholder="Full Name"
                value={name} onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={2.5}>
              <TextField
                fullWidth size="small" placeholder="Phone Number"
                value={phone} onChange={(e) => setPhone(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={2.5}>
              <TextField
                fullWidth size="small" type="password" placeholder="Password"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={2.5}>
              <TextField
                select fullWidth size="small" label="Role"
                value={role} onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="OPERATOR">OPERATOR (Staff)</MenuItem>
                <MenuItem value="ADMIN">ADMIN (Manager)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={1.5}>
              <Button
                fullWidth type="submit" variant="contained" disableElevation
                sx={{ height: 40, bgcolor: "#1e293b", "&:hover": { bgcolor: "#334155" } }}
              >
                Create
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* USERS LIST TABLE */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 1 }}>
          <GroupRoundedIcon sx={{ color: "#6366f1" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#334155" }}>
            Office Staff Directory
          </Typography>
        </Box>
        <Divider />
        
        {loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Staff Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Contact Info</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: "#475569" }}>System Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staffMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    No staff members found.
                  </TableCell>
                </TableRow>
              ) : (
                staffMembers.map((u) => (
                  <TableRow key={u.id} hover sx={{ "& td": { py: 2 } }}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: "0.85rem", bgcolor: "#e2e8f0", color: "#475569" }}>
                          {u.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography sx={{ fontWeight: 600, color: "#1e293b" }}>
                          {u.name} {u.id === user.userId && "(You)"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: "#64748b" }}>
                      {u.phone}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={u.role}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          bgcolor: u.role === "ADMIN" ? "#eff6ff" : "#f1f5f9",
                          color: u.role === "ADMIN" ? "#1d4ed8" : "#475569",
                          border: "1px solid",
                          borderColor: u.role === "ADMIN" ? "#dbeafe" : "#e2e8f0",
                        }}
                      />
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

export default Users;