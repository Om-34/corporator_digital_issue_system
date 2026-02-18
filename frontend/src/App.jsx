import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// ✅ ADDED: Theme Imports
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Complaints from "./pages/Complaints";
import NewComplaint from "./pages/NewComplaint";
import ComplaintDetails from "./pages/ComplaintDetails";
import Users from "./pages/Users";
import Reasons from "./pages/Reasons";
import ActivityLogs from "./pages/ActivityLogs";
import WardReports from "./pages/WardReports";

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* ✅ CssBaseline ensures consistent background colors and fonts across browsers */}
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/complaints" element={<Layout><Complaints /></Layout>} />
            <Route path="/complaints/new" element={<Layout><NewComplaint /></Layout>} />
            <Route path="/complaints/:id" element={<Layout><ComplaintDetails /></Layout>} />
            <Route path="/admin/users" element={<Layout><Users /></Layout>} />
            <Route path="/admin/reasons" element={<Layout><Reasons /></Layout>} />
            <Route path="/admin/activity" element={<Layout><ActivityLogs /></Layout>} />
            <Route path="/reports/ward" element={<Layout><WardReports /></Layout>} />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;