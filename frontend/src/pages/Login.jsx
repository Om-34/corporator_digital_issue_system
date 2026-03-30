import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link as RouterLink } from "react-router-dom"; // ✅ Added Link

import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link, // ✅ Added MUI Link
  Divider,
} from "@mui/material";

import corporatorImage from "../assets/corporator_n.jpg";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        phone,
        password,
      });

      // The backend now returns { token, user: { id, name, role, officeId } }
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login Error:", err);
      alert(err.response?.data?.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "60% 40%" },
        overflow: "hidden",
      }}
    >
      {/* LEFT SIDE — BACKGROUND IMAGE */}
      <Box
        sx={{
          backgroundImage: `linear-gradient(
            rgba(0,0,0,0.6),
            rgba(0,0,0,0.6)
          ), url(${corporatorImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: { xs: "none", md: "flex" },
          alignItems: "flex-end",
          p: 6,
          color: "#fff",
        }}
      >
        <Box>
          <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: "-0.02em", mb: 1 }}>
            Corporator <Box component="span" sx={{ color: "#6366f1" }}>Issue</Box> System
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 400, maxWidth: "500px" }}>
            A unified digital platform for citizens and ward offices to manage grievances efficiently.
          </Typography>
        </Box>
      </Box>

      {/* RIGHT SIDE — LOGIN FORM */}
      <Box
        sx={{
          backgroundColor: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 400,
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
          }}
        >
          <Typography variant="h5" fontWeight={800} sx={{ color: "#1e293b", mb: 1 }}>
            Welcome Back
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={4}>
            Enter your credentials to access the portal
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Phone Number"
              margin="normal"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
            />

            <Button
              fullWidth
              variant="contained"
              type="submit"
              size="large"
              disableElevation
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontWeight: 700,
                bgcolor: "#0f172a",
                "&:hover": { bgcolor: "#1e293b" }
              }}
            >
              SIGN IN
            </Button>
          </form>

          {/* ✅ NEW: CITIZEN REGISTRATION LINK */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
              NEW CITIZEN?
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account in your ward?
            </Typography>
            <Link
              component={RouterLink}
              to="/register"
              sx={{
                display: "inline-block",
                mt: 1,
                fontWeight: 700,
                color: "#6366f1",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" }
              }}
            >
              Register your profile here
            </Link>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;