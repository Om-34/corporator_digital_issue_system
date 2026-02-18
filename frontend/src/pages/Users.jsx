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
} from "@mui/material";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";

const Users = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!name || !password) {
      alert("Name and password required");
      return;
    }

    await api.post("/users", { name, phone, password });
    alert("User created");

    setName("");
    setPhone("");
    setPassword("");
    fetchUsers();
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", py: 4, px: 2 }}>
      {/* PAGE HEADER */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b", mb: 1 }}>
          User Management
        </Typography>
        <Typography sx={{ color: "#64748b" }}>
          Administrative control panel for managing office staff and portal access.
        </Typography>
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
            Create New User
          </Typography>
        </Box>

        <form onSubmit={handleCreateUser}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3.5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3.5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3.5}>
              <TextField
                fullWidth
                size="small"
                type="password"
                placeholder="Security Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={1.5}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disableElevation
                sx={{ 
                  height: 40, 
                  bgcolor: "#1e293b", 
                  "&:hover": { bgcolor: "#334155" } 
                }}
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
            Local Staff Directory
          </Typography>
        </Box>
        <Divider />
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Staff Name</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Contact Info</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: "#475569" }}>System Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover sx={{ "& td": { py: 2 } }}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: "0.85rem", bgcolor: "#e2e8f0", color: "#475569" }}>
                      {u.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography sx={{ fontWeight: 600, color: "#1e293b" }}>
                      {u.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: "#64748b" }}>
                  {u.phone || "No contact provided"}
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
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default Users;