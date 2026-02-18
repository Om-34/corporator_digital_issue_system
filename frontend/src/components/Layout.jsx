import { useState } from "react";
import { Box, Drawer, IconButton, useTheme, useMediaQuery, AppBar, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SideBar from "./SideBar";
import TopBar from "./TopBar";

const drawerWidth = 260;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  
  // Detects if screen is smaller than 'md' (900px)
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      
      {/* MOBILE HEADER - Only shows on small screens */}
      {isMobile && (
        <AppBar 
          position="fixed" 
          sx={{ 
            width: "100%", 
            bgcolor: "rgba(255, 255, 255, 0.8)", 
            backdropFilter: "blur(10px)",
            color: "#1e293b",
            borderBottom: "1px solid #e2e8f0",
            boxShadow: "none"
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: "-0.05em" }}>
              CORP-OFFICE
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* NAVIGATION DRAWER */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile View: Slide-out Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }} // Better performance on mobile
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, border: "none" },
          }}
        >
          <SideBar />
        </Drawer>

        {/* Desktop View: Permanent Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, border: "none" },
          }}
          open
        >
          <SideBar />
        </Drawer>
      </Box>

      {/* CONTENT AREA */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Hide TopBar on mobile if you want, or keep it inside the main flow */}
        {!isMobile && <TopBar />}
        
        <Box 
          sx={{ 
            p: { xs: 2, md: 4 }, 
            mt: { xs: 8, md: 0 }, // Adds space for the fixed Mobile AppBar
            flexGrow: 1 
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;