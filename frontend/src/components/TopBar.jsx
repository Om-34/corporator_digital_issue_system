import { AppBar, Toolbar, Typography, Box, Button, IconButton, Badge, Drawer, List, ListItem, ListItemText, Divider, ListItemButton } from "@mui/material";
import { useContext, useEffect, useState } from "react"; // ✅ Added useState
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import NotificationsIcon from "@mui/icons-material/Notifications"; // ✅ Added Icon
import "react-toastify/dist/ReactToastify.css";

const socket = io("http://localhost:5000");

const TopBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ STATE FOR NOTIFICATIONS
  const [notifications, setNotifications] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    if (user?.officeId) {
      socket.emit("join_office", user.officeId);

      const isStaff = user?.role === "ADMIN" || user?.role === "OPERATOR";
      
      if (isStaff) {
        socket.on("new_complaint_alert", (data) => {
          // 1. Add to local history state
          setNotifications((prev) => [{ ...data, time: new Date() }, ...prev]);

          // 2. Browser Notification
          if (Notification.permission === "granted") {
            const notif = new Notification("🚨 New Complaint!", {
              body: `Issue ${data.issueNo} from ${data.personName}`,
            });
            notif.onclick = () => { navigate(`/complaints/${data.id}`); window.focus(); };
          }

          // 3. On-Screen Toast
          toast.info(
            <Box onClick={() => navigate(`/complaints/${data.id}`)}>
              <Typography variant="body2" fontWeight={700}>🚨 New Complaint!</Typography>
              <Typography variant="caption">{data.issueNo} - {data.personName}</Typography>
            </Box>
          );
        });
      }
    }
    return () => socket.off("new_complaint_alert");
  }, [user, navigate]);

  return (
    <>
      <ToastContainer />
      <AppBar position="static" elevation={0} sx={{ backgroundColor: "#ffffff", color: "#111827", borderBottom: "1px solid #e5e7eb" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={600}>Corporator Office System</Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            
            {/* ✅ NOTIFICATION BELL */}
            {(user?.role === "ADMIN" || user?.role === "OPERATOR") && (
              <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            )}

            <Typography variant="body2">{user?.name}</Typography>
            <Button variant="contained" color="error" size="small" onClick={handleLogout} sx={{ textTransform: "none", fontWeight: 600 }}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ✅ NOTIFICATION HISTORY DRAWER */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 320, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Notification History</Typography>
          <Divider />
          <List>
            {notifications.length === 0 ? (
              <Typography variant="body2" sx={{ p: 2, color: "text.secondary" }}>No recent alerts</Typography>
            ) : (
              notifications.map((n, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton onClick={() => { navigate(`/complaints/${n.id}`); setDrawerOpen(false); }}>
                    <ListItemText 
                      primary={`Issue: ${n.issueNo}`} 
                      secondary={`${n.personName} • ${n.time.toLocaleTimeString()}`} 
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
          {notifications.length > 0 && (
            <Button fullWidth color="inherit" onClick={() => setNotifications([])} sx={{ mt: 2, fontSize: '0.75rem' }}>
              Clear History
            </Button>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default TopBar;