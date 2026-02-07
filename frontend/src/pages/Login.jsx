import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
} from "@mui/material";

import corporatorImage from "../assets/corporator.jpg";

const Login = () => {
  // 🔒 LOGIC UNCHANGED
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

      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid login");
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
            rgba(0,0,0,0.55),
            rgba(0,0,0,0.55)
          ), url(${corporatorImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: { xs: "none", md: "flex" },
          alignItems: "flex-end",
          p: 4,
          color: "#fff",
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Corporator Office System
          </Typography>
          <Typography sx={{ opacity: 0.9 }}>
            Digital complaint & issue management
          </Typography>
        </Box>
      </Box>

      {/* RIGHT SIDE — LOGIN FORM */}
      <Box
        sx={{
          backgroundColor: "#f4f6f8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          sx={{
            width: "100%",
            maxWidth: 420,
            p: 4,
            borderRadius: 3,
            boxShadow: "0 25px 70px rgba(0,0,0,0.18)",
          }}
        >
          <Typography variant="h5" fontWeight={700} mb={1}>
            Welcome Back
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={3}>
            Login to manage complaints
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Phone Number"
              margin="normal"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              fullWidth
              variant="contained"
              type="submit"
              sx={{
                mt: 3,
                py: 1.3,
                fontWeight: 600,
              }}
            >
              LOGIN
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
