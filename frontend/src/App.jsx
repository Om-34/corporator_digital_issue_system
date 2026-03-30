import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";

// ✅ ADDED: Theme Imports
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register"; 
import Dashboard from "./pages/Dashboard";
import Complaints from "./pages/Complaints";
import NewComplaint from "./pages/NewComplaint";
import ComplaintDetails from "./pages/ComplaintDetails";
import Users from "./pages/Users";
import Reasons from "./pages/Reasons";
import ActivityLogs from "./pages/ActivityLogs";
import WardReports from "./pages/WardReports";
import OfficeSettings from "./pages/OfficeSettings";

// ✅ NEW: Import Master Dashboard
import MasterDashboard from "./pages/MasterDashboard";

// ==========================================
// ✅ PROTECTED ROUTE COMPONENT
// ==========================================
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null; 

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} /> 

            {/* SHARED PROTECTED ROUTES */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "OPERATOR", "USER", "SUPER_ADMIN"]}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* ✅ NEW: MASTER ADMIN EXCLUSIVE ROUTE */}
            <Route 
              path="/master/dashboard" 
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                  <MasterDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/complaints" 
              element={<ProtectedRoute allowedRoles={["ADMIN", "OPERATOR", "USER"]}><Complaints /></ProtectedRoute>} 
            />
            <Route 
              path="/complaints/new" 
              element={<ProtectedRoute allowedRoles={["ADMIN", "OPERATOR", "USER"]}><NewComplaint /></ProtectedRoute>} 
            />
            <Route 
              path="/complaints/:id" 
              element={<ProtectedRoute allowedRoles={["ADMIN", "OPERATOR", "USER"]}><ComplaintDetails /></ProtectedRoute>} 
            />

            {/* OPERATOR & ADMIN ROUTES */}
            <Route 
              path="/reports/ward" 
              element={<ProtectedRoute allowedRoles={["ADMIN", "OPERATOR"]}><WardReports /></ProtectedRoute>} 
            />

            {/* ADMIN ONLY ROUTES */}
            <Route 
              path="/admin/users" 
              element={<ProtectedRoute allowedRoles={["ADMIN"]}><Users /></ProtectedRoute>} 
            />
            <Route 
              path="/admin/reasons" 
              element={<ProtectedRoute allowedRoles={["ADMIN"]}><Reasons /></ProtectedRoute>} 
            />
            <Route 
              path="/admin/activity" 
              element={<ProtectedRoute allowedRoles={["ADMIN"]}><ActivityLogs /></ProtectedRoute>} 
            />

            {/* OFFICE SETTINGS (Accessible by Admin and Master) */}
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                  <OfficeSettings />
                </ProtectedRoute>
              } 
            />

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;