import React, { useState, useEffect } from "react";
import { 
  Box, Grid, Paper, TextField, Button, Typography, 
  MenuItem, Link, Alert, CircularProgress, InputAdornment, Container, Stack
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Icons for a professional touch
import PersonIcon from '@mui/icons-material/PersonOutline';
import PhoneIcon from '@mui/icons-material/PhoneIphone';
import LockIcon from '@mui/icons-material/LockOutlined';
import BusinessIcon from '@mui/icons-material/Business';

const Register = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    office_id: ""
  });

  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingOffices, setFetchingOffices] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/public/offices");
        setOffices(response.data);
      } catch (err) {
        setError("Could not load ward offices. Please try again later.");
      } finally {
        setFetchingOffices(false);
      }
    };
    fetchOffices();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }
    if (!formData.office_id) {
        return setError("Please select a Ward/Office");
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/register-citizen", {
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        office_id: formData.office_id,
        role: "USER" 
      });
      navigate("/", { state: { message: "Registration successful! Please login." } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container component="main" sx={{ height: "100vh", overflow: 'hidden' }}>
      {/* LEFT SIDE: BRANDING PANEL */}
      <Grid
        item xs={false} sm={4} md={7}
        sx={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          display: { xs: "none", sm: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          p: 8,
          color: "white",
          position: 'relative'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography variant="h2" fontWeight={900} sx={{ letterSpacing: "-0.05em", mb: 2 }}>
            CITIZEN <Box component="span" sx={{ color: "#6366f1" }}>PORTAL</Box>
          </Typography>
          <Typography variant="h5" sx={{ color: "#94a3b8", mb: 6, maxWidth: '500px', lineHeight: 1.4 }}>
            Direct digital connectivity between residents and Ward Administration for a smarter Pune.
          </Typography>
          
          <Stack direction="row" spacing={3}>
             <Box sx={{ p: 3, bgcolor: "rgba(255,255,255,0.03)", borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', flex: 1 }}>
                <Typography variant="h6" fontWeight={700} color="#6366f1">Transparent</Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8" }}>Track status updates on your grievances in real-time.</Typography>
             </Box>
             <Box sx={{ p: 3, bgcolor: "rgba(255,255,255,0.03)", borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', flex: 1 }}>
                <Typography variant="h6" fontWeight={700} color="#6366f1">Efficient</Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8" }}>Automated routing to responsible ward operators.</Typography>
             </Box>
          </Stack>
        </Box>
      </Grid>

      {/* RIGHT SIDE: REGISTRATION FORM */}
      <Grid item xs={12} sm={8} md={5} sx={{ display: 'flex', alignItems: 'center', bgcolor: "#f8fafc" }}>
        <Container maxWidth="xs">
          <Box sx={{ py: 4, display: "flex", flexDirection: "column" }}>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#1e293b', mb: 1 }}>Create Account</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Complete the form to access civic services</Typography>

            {error && <Alert severity="error" variant="filled" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal" required fullWidth label="Full Name" name="name"
                autoFocus value={formData.name} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action"/></InputAdornment> }}
              />
              <TextField
                margin="normal" required fullWidth label="Phone Number" name="phone"
                value={formData.phone} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon color="action"/></InputAdornment> }}
              />
              
              <TextField
                select margin="normal" required fullWidth label="Your Ward Office"
                name="office_id" value={formData.office_id} onChange={handleChange}
                disabled={fetchingOffices}
                InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon color="action"/></InputAdornment> }}
              >
                {offices.map((office) => (
                  <MenuItem key={office.id} value={office.id}>{office.office_name}</MenuItem>
                ))}
              </TextField>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    margin="normal" required fullWidth label="Password"
                    type="password" name="password" value={formData.password} onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    margin="normal" required fullWidth label="Confirm"
                    type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit" fullWidth variant="contained"
                disabled={loading}
                sx={{ 
                  mt: 4, py: 1.8, fontWeight: 700, borderRadius: 2, 
                  bgcolor: "#0f172a", textTransform: 'none', fontSize: '1rem',
                  "&:hover": { bgcolor: "#1e293b", boxShadow: '0px 4px 20px rgba(0,0,0,0.1)' } 
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Complete Registration"}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Already registered?{' '}
                  <Link 
                    onClick={() => navigate("/")} 
                    sx={{ cursor: "pointer", color: "#6366f1", fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: 'underline' } }}
                  >
                    Sign In Here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Grid>
    </Grid>
  );
};

export default Register;