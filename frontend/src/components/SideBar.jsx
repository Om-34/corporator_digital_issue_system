import { Box, List, ListItemButton, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const SideBar = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  return (
    <Box
      sx={{
        width: 240,
        backgroundColor: "#111827",
        color: "#fff",
        p: 2,
      }}
    >
      <List>
        <NavItem label="Dashboard" onClick={() => navigate("/dashboard")} />
        <NavItem label="Complaints" onClick={() => navigate("/complaints")} />
        <NavItem label="New Complaint" onClick={() => navigate("/complaints/new")} />

        {user?.role === "ADMIN" && (
          <>
            <NavItem label="Users" onClick={() => navigate("/admin/users")} />
            <NavItem label="Categories" onClick={() => navigate("/admin/reasons")} />
            <NavItem label="Activity Logs" onClick={() => navigate("/admin/activity")} />
            <NavItem label="Ward Reports"onClick={() => navigate("/reports/ward")}
/>

          </>
        )}
      </List>
    </Box>
  );
};

const NavItem = ({ label, onClick }) => (
  <ListItemButton
    onClick={onClick}
    sx={{
      borderRadius: 1,
      mb: 1,
      "&:hover": { backgroundColor: "#1f2937" },
    }}
  >
    <ListItemText primary={label} />
  </ListItemButton>
);

export default SideBar;
