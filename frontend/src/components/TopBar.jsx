import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const TopBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();          // 🔒 existing logic
    navigate("/");     // 🔒 existing flow
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "#ffffff",
        color: "#111827",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* LEFT — TITLE */}
        <Typography variant="h6" fontWeight={600}>
          Corporator Office System
        </Typography>

        {/* RIGHT — USER + LOGOUT */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2">
            {user?.name}
          </Typography>

          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={handleLogout}
            sx={{
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
