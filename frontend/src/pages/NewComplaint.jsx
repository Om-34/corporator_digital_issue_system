import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  CircularProgress,
  Grid,
  Divider,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import DescriptionIcon from "@mui/icons-material/Description";

const NewComplaint = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reasons, setReasons] = useState([]);

  // Form States
  const [formData, setFormData] = useState({
    personName: "",
    contact: "",
    address: "",
    area: "",
    ward_no: "",
    gender: "Male",
    reasonId: "",
    description: "",
  });

  // ✅ NEW: File State
  const [document, setDocument] = useState(null);

  useEffect(() => {
    // Fetch categories (reasons)
    api.get("/reasons").then((res) => setReasons(res.data)).catch(console.error);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ UPDATED: Smarter Submit Logic (Logic preserved)
  const handleSubmit = async () => {
    if (!formData.personName || !formData.reasonId || !formData.description) {
      alert("Please fill required fields");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/complaints", formData);
      const { issueNo, id: complaintId } = res.data;

      let uploadMessage = "";

      if (document && complaintId) {
        try {
          const docData = new FormData();
          docData.append("document", document);

          await api.post(`/complaint-documents/${complaintId}`, docData);
          console.log("Document uploaded successfully");
        } catch (uploadError) {
          console.error("Upload failed:", uploadError);
          uploadMessage = "\n⚠️ However, the document could not be uploaded.";
        }
      }

      alert(`Complaint Registered Successfully! ✅\nIssue No: ${issueNo}${uploadMessage}`);
      navigate("/complaints");

    } catch (error) {
      console.error("Registration Error:", error);
      alert("Failed to register complaint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", py: 4, px: 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          border: "1px solid #e2e8f0",
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b", mb: 1 }}>
            Register New Complaint
          </Typography>
          <Typography sx={{ color: "#64748b" }}>
            Fill in the details below to log a new grievance into the system.
          </Typography>
        </Box>

        <Box component="form">
          {/* SECTION 1: CITIZEN INFO */}
          <Box sx={{ mb: 5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
              <PersonOutlineIcon sx={{ color: "#6366f1" }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#334155" }}>
                Citizen Information
              </Typography>
            </Box>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Person Name *"
                  name="personName"
                  value={formData.personName}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Ward No"
                  name="ward_no"
                  value={formData.ward_no}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 5, borderStyle: "dashed" }} />

          {/* SECTION 2: COMPLAINT INFO */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
              <DescriptionIcon sx={{ color: "#6366f1" }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#334155" }}>
                Complaint Details
              </Typography>
            </Box>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Complaint Category *"
                  name="reasonId"
                  value={formData.reasonId}
                  onChange={handleChange}
                >
                  {reasons.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.reason_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Detailed Description *"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the issue in detail..."
                />
              </Grid>

              {/* ATTACH DOCUMENT SECTION */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    mt: 1,
                    p: 3,
                    border: "2px dashed #e2e8f0",
                    borderRadius: 3,
                    textAlign: "center",
                    bgcolor: "#f8fafc",
                    transition: "border-color 0.2s",
                    "&:hover": { borderColor: "#6366f1" },
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 40, color: "#94a3b8", mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#475569" }}>
                    Attach Paper Complaint (Optional)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                    Upload scanned photo or PDF of handwritten complaint
                  </Typography>

                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    sx={{ textTransform: "none", borderRadius: 2 }}
                  >
                    {document ? "Change File" : "Choose File"}
                    <input
                      type="file"
                      hidden
                      accept="image/*,.pdf"
                      onChange={(e) => setDocument(e.target.files[0])}
                    />
                  </Button>
                  
                  {document && (
                    <Typography variant="caption" sx={{ display: "block", mt: 1, color: "#6366f1", fontWeight: 600 }}>
                      Selected: {document.name}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mt: 5, display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/complaints")}
              sx={{ px: 4, color: "#64748b", borderColor: "#e2e8f0" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="large"
              disableElevation
              onClick={handleSubmit}
              disabled={loading}
              sx={{ px: 6, bgcolor: "#1e293b", "&:hover": { bgcolor: "#334155" } }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Submit Complaint"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default NewComplaint;