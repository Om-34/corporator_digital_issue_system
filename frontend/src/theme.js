import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0f172a", // Deep navy preserved
    },
    secondary: {
      main: "#6366f1", // Shifted to a brighter Indigo for better SaaS accents
    },
    success: { main: "#10b981" },
    warning: { main: "#f59e0b" },
    error: { main: "#ef4444" },
    background: {
      default: "#f8fafc", // Lighter slate for a cleaner feel
      paper: "#ffffff",
    },
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
    h4: { fontWeight: 800, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700 },
    body1: { fontSize: "0.9375rem" },
  },
  shape: {
    borderRadius: 12, // Modern rounded corners
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "1px solid #e2e8f0", // Replaces heavy shadows with crisp borders
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          padding: "8px 16px",
        },
      },
    },
  },
});

export default theme;