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
import SettingsIcon from "@mui/icons-material/SettingsApplicationsRounded"; 
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import AnalyticsIcon from "@mui/icons-material/InsightsRounded"; // ✅ Icon for Analytics

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // Define menus for different roles
  const menuItems = [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard", roles: ["ADMIN", "OPERATOR", "USER", "SUPER_ADMIN"] },
    { label: "Complaints", icon: <FeedbackIcon />, path: "/complaints", roles: ["ADMIN", "OPERATOR", "USER"] },
    { label: "New Complaint", icon: <AddIcon />, path: "/complaints/new", roles: ["ADMIN", "OPERATOR", "USER"] },
  ];

  const adminItems = [
    { label: "Users", icon: <PeopleIcon />, path: "/admin/users", roles: ["ADMIN"] },
    { label: "Categories", icon: <CategoryIcon />, path: "/admin/reasons", roles: ["ADMIN"] },
    { label: "Activity Logs", icon: <HistoryIcon />, path: "/admin/activity", roles: ["ADMIN"] },
    { label: "Ward Reports", icon: <ReportIcon />, path: "/reports/ward", roles: ["ADMIN", "OPERATOR"] },
    { label: "Office Settings", icon: <SettingsIcon />, path: "/admin/settings", roles: ["ADMIN"] },
  ];

  // ✅ UPDATED: Master Admin Special Items
  const masterItems = [
    { label: "Global Analytics", icon: <AnalyticsIcon />, path: "/master/dashboard", roles: ["SUPER_ADMIN"] },
    { label: "Manage All Offices", icon: <AdminPanelSettingsIcon />, path: "/admin/settings", roles: ["SUPER_ADMIN"] },
  ];

  // Filter items based on user role
  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role));
  const filteredAdminItems = adminItems.filter(item => item.roles.includes(user?.role));
  const filteredMasterItems = masterItems.filter(item => item.roles.includes(user?.role));

  return (
    <Box
      sx={{
        width: 260,
        backgroundColor: "#0f172a",
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
      <Box sx={{ flexGrow: 1, px: 2, overflowY: "auto" }}>
        <List disablePadding>
          {filteredMenuItems.map((item) => (
            <NavItem 
              key={item.label} 
              item={item} 
              isActive={location.pathname === item.path} 
              onClick={() => navigate(item.path)} 
            />
          ))}

          {/* MASTER ADMIN SECTION */}
          {filteredMasterItems.length > 0 && (
            <>
              <Typography 
                variant="caption" 
                sx={{ color: "#6366f1", fontWeight: 700, px: 2, mt: 3, mb: 1, display: "block", textTransform: "uppercase" }}
              >
                System Control
              </Typography>
              {filteredMasterItems.map((item) => (
                <NavItem 
                  key={item.label} 
                  item={item} 
                  isActive={location.pathname === item.path} 
                  onClick={() => navigate(item.path)} 
                />
              ))}
            </>
          )}

          {/* ADMINISTRATION SECTION */}
          {filteredAdminItems.length > 0 && (
            <>
              <Typography 
                variant="caption" 
                sx={{ color: "#475569", fontWeight: 700, px: 2, mt: 3, mb: 1, display: "block", textTransform: "uppercase" }}
              >
                Administration
              </Typography>
              {filteredAdminItems.map((item) => (
                <NavItem 
                  key={item.label} 
                  item={item} 
                  isActive={location.pathname === item.path} 
                  onClick={() => navigate(item.path)} 
                />
              ))}
            </>
          )}
        </List>
      </Box>

      {/* USER PROFILE SECTION */}
      <Box sx={{ p: 2, borderTop: "1px solid #1e293b", mt: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: "#6366f1", fontSize: "0.9rem", fontWeight: 700 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ overflow: "hidden" }}>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ color: "#fff" }}>
              {user?.name || "User"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", display: "block", textTransform: "capitalize" }}>
              {user?.role?.replace('_', ' ').toLowerCase()}
            </Typography>
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
      bgcolor: isActive ? "rgba(99, 102, 241, 0.15)" : "transparent",
      color: isActive ? "#fff" : "#94a3b8",
      transition: "all 0.2s",
      "&:hover": { 
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        color: "#fff" 
      },
      "& .MuiListItemIcon-root": {
        color: isActive ? "#6366f1" : "inherit",
        minWidth: 40
      }
    }}
  >
    <ListItemIcon>{item.icon}</ListItemIcon>
    <ListItemText 
      primary={item.label} 
      primaryTypographyProps={{ 
        fontSize: "0.875rem", 
        fontWeight: isActive ? 700 : 500 
      }} 
    />
  </ListItemButton>
);

export default SideBar;