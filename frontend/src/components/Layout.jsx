import { Box } from "@mui/material";
import TopBar from "./TopBar";
import SideBar from "./SideBar";

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <SideBar />
      <Box sx={{ flex: 1 }}>
        <TopBar />
        <Box sx={{ p: 4 }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default Layout;
