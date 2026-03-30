import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Grid,
  InputAdornment,
  Autocomplete
} from "@mui/material";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import SearchIcon from "@mui/icons-material/Search";

const OfficeSettings = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Office States
  const [officeName, setOfficeName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [allOffices, setAllOffices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // New User States
  const [newUserName, setNewUserName] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserPass, setNewUserPass] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const isMaster = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      navigate("/dashboard");
    } else {
      isMaster ? fetchAllOffices() : fetchOfficeDetails();
    }
  }, [user]);

  const fetchOfficeDetails = async () => {
    try {
      const res = await api.get("/office/details");
      setOfficeName(res.data.office_name);
      setOriginalName(res.data.office_name);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load office settings" });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllOffices = async () => {
    try {
      const res = await api.get("/office/all");
      setAllOffices(res.data);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load all offices" });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Search Filter Logic for the Table
  const filteredOffices = allOffices.filter((off) =>
    off.office_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ==========================================
  // MASTER ACTION: ONBOARD OFFICE + ADMIN
  // ==========================================
  const handleMasterOnboard = async (e) => {
    e.preventDefault();
    if (!officeName || !newUserName || !newUserPhone || !newUserPass) {
      return setMessage({ type: "error", text: "Please fill all fields." });
    }
    setSaving(true);
    try {
      await api.post("/auth/register-office", {
        officeName,
        adminName: newUserName,
        phone: newUserPhone,
        password: newUserPass
      });
      setMessage({ type: "success", text: `Onboarded ${officeName} successfully.` });
      // Clear Form
      setOfficeName(""); setNewUserName(""); setNewUserPhone(""); setNewUserPass("");
      fetchAllOffices();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Onboarding failed" });
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // REGULAR ADMIN ACTION: UPDATE NAME
  // ==========================================
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/office/update", { officeName });
      setOriginalName(officeName);
      setMessage({ type: "success", text: "Office identity updated!" });
    } catch (error) {
      setMessage({ type: "error", text: "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", py: 4, px: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color="#1e293b">
          {isMaster ? "Global Office Management" : "Office Settings"}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {isMaster ? "Create new offices or assign admins to existing ones." : "Manage your office identity."}
        </Typography>
      </Box>

      {message.text && <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>}

      {/* --- ONBOARDING FORM (MASTER ONLY) --- */}
      {isMaster && (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #e2e8f0", mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <PersonAddRoundedIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>Onboard New Office & Admin</Typography>
          </Box>

          <form onSubmit={handleMasterOnboard}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                {/* ✅ AUTOCOMPLETE SEARCH & DROPDOWN FOR OFFICE NAME */}
                <Autocomplete
                  freeSolo
                  options={allOffices.map((option) => option.office_name)}
                  value={officeName}
                  onInputChange={(event, newInputValue) => {
                    setOfficeName(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Office Name"
                      placeholder="Type to search or create new office"
                      required
                      size="small"
                      helperText="Selecting an existing office will add an additional admin to it."
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Admin Name" size="small" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Phone Number" size="small" value={newUserPhone} onChange={(e) => setNewUserPhone(e.target.value)} required />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Password" type="password" size="small" value={newUserPass} onChange={(e) => setNewUserPass(e.target.value)} required />
              </Grid>
              <Grid item xs={12} sx={{ textAlign: 'right' }}>
                <Button type="submit" variant="contained" disableElevation disabled={saving} sx={{ bgcolor: "#0f172a", px: 4 }}>
                  {saving ? "Processing..." : "Complete Onboarding"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}

      {/* --- TABLE & SEARCH SECTION --- */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #e2e8f0" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <BusinessRoundedIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              {isMaster ? "Existing Ward Offices" : "Office Identity"}
            </Typography>
          </Box>

          {isMaster && (
            <TextField
              size="small"
              placeholder="Search table..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />
          )}
        </Box>

        {isMaster ? (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 700 }}>Office Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>System ID</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOffices.length > 0 ? (
                filteredOffices.map((off) => (
                  <TableRow key={off.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{off.office_name}</TableCell>
                    <TableCell variant="caption" sx={{ color: "text.disabled" }}>{off.id}</TableCell>
                    <TableCell align="right">
                      <IconButton color="error" size="small">
                        <DeleteOutlineIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">No matching offices found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <Box>
            <Typography variant="caption" fontWeight={700} color="textSecondary" sx={{ mb: 1, display: "block" }}>
              CURRENT DISPLAY NAME
            </Typography>
            <TextField
              fullWidth
              value={officeName}
              onChange={(e) => setOfficeName(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Button variant="contained" onClick={handleUpdate} sx={{ bgcolor: "#0f172a" }}>
              Update Office Name
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default OfficeSettings;