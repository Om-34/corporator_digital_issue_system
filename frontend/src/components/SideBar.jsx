import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, Avatar } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Icons for a professional feel
import DashboardIcon from "@mui/icons-material/GridViewRounded";
import FeedbackIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import AddIcon from "@mui/icons-material/AddCircleOutlineRounded";
import PeopleIcon from "@mui/icons-material/GroupRounded";
import CategoryIcon from "@mui/icons-material/CategoryRounded";
import HistoryIcon from "@mui/icons-material/HistoryRounded";
import ReportIcon from "@mui/icons-material/AssessmentRounded";

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const menuItems = [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { label: "Complaints", icon: <FeedbackIcon />, path: "/complaints" },
    { label: "New Complaint", icon: <AddIcon />, path: "/complaints/new" },
  ];

  const adminItems = [
    { label: "Users", icon: <PeopleIcon />, path: "/admin/users" },
    { label: "Categories", icon: <CategoryIcon />, path: "/admin/reasons" },
    { label: "Activity Logs", icon: <HistoryIcon />, path: "/admin/activity" },
    { label: "Ward Reports", icon: <ReportIcon />, path: "/reports/ward" },
  ];

  return (
    <Box
      sx={{
        width: 260, // Slightly wider for better text fit
        backgroundColor: "#0f172a", // Matching theme primary
        color: "#f8fafc",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #1e293b",
      }}
    >
      {/* BRANDING */}
      <Box sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#fff", letterSpacing: "-0.05em" }}>
          CORPORATOR <Box component="span" sx={{ color: "#6366f1" }}>SYS</Box>
        </Typography>
      </Box>

      {/* NAVIGATION */}
      <Box sx={{ flexGrow: 1, px: 2 }}>
        <List disablePadding>
          {menuItems.map((item) => (
            <NavItem key={item.label} item={item} isActive={location.pathname === item.path} onClick={() => navigate(item.path)} />
          ))}

          {user?.role === "ADMIN" && (
            <>
              <Typography variant="caption" sx={{ color: "#475569", fontWeight: 700, px: 2, mt: 3, mb: 1, display: "block", textTransform: "uppercase" }}>
                Administration
              </Typography>
              {adminItems.map((item) => (
                <NavItem key={item.label} item={item} isActive={location.pathname === item.path} onClick={() => navigate(item.path)} />
              ))}
            </>
          )}
        </List>
      </Box>

      {/* USER PROFILE SECTION */}
      <Box sx={{ p: 2, borderTop: "1px solid #1e293b", mt: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: "#334155", fontSize: "0.9rem" }}>{user?.name?.charAt(0)}</Avatar>
          <Box sx={{ overflow: "hidden" }}>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ color: "#fff" }}>{user?.name || "Ramesh Patil"}</Typography>
            <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>{user?.role}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const NavItem = ({ item, isActive, onClick }) => (
  <ListItemButton
    onClick={onClick}
    sx={{
      borderRadius: 2,
      mb: 0.5,
      py: 1.2,
      bgcolor: isActive ? "rgba(99, 102, 241, 0.1)" : "transparent",
      color: isActive ? "#818cf8" : "#94a3b8",
      transition: "all 0.2s",
      "&:hover": { 
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        color: "#fff" 
      },
      "& .MuiListItemIcon-root": {
        color: "inherit",
        minWidth: 40
      }
    }}
  >
    <ListItemIcon>{item.icon}</ListItemIcon>
    <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: isActive ? 600 : 500 }} />
  </ListItemButton>
);

export default SideBar;