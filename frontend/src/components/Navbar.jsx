import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Corporator Office System
        </Typography>

        <Button color="inherit" component={Link} to="/dashboard">
          Dashboard
        </Button>
        <Button color="inherit" component={Link} to="/complaints">
          Complaints
        </Button>
        <Button color="inherit" component={Link} to="/complaints/new">
          New Complaint
        </Button>

        {user.role === "ADMIN" && (
          <>
            <Button color="inherit" component={Link} to="/admin/users">
              Users
            </Button>
            <Button color="inherit" component={Link} to="/admin/reasons">
              Categories
            </Button>
          </>
        )}

        <Button color="error" variant="contained" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
