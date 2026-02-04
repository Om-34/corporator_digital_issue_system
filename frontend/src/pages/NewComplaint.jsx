import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

import {
  TextField,
  Button,
  Paper,
  Typography,
  MenuItem,
  Box,
} from "@mui/material";

const NewComplaint = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form fields (UNCHANGED)
  const [personName, setPersonName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [reasonId, setReasonId] = useState("");
  const [description, setDescription] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Load reasons
  useEffect(() => {
    fetchReasons();
  }, []);

  const fetchReasons = async () => {
    try {
      const res = await api.get("/reasons");
      const activeReasons = res.data.filter((r) => r.is_active);
      setReasons(activeReasons);
    } catch (error) {
      console.error(error);
      alert("Failed to load issue categories");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reasonId || !description) {
      alert("Please select issue category and enter description");
      return;
    }

    setLoading(true);

    try {
      await api.post("/complaints", {
        personName,
        contact,
        address,
        gender,
        reasonId,
        description,
      });

      alert("Complaint registered successfully");
      navigate("/complaints");
    } catch (error) {
      console.error(error);
      alert("Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ padding: 3, maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        New Complaint
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Person Name"
          fullWidth
          margin="normal"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
        />

        <TextField
          label="Contact"
          fullWidth
          margin="normal"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />

        <TextField
          label="Address"
          fullWidth
          margin="normal"
          multiline
          rows={2}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <TextField
          select
          label="Gender"
          fullWidth
          margin="normal"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <MenuItem value="">Select</MenuItem>
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </TextField>

        <TextField
          select
          label="Issue Category"
          fullWidth
          margin="normal"
          value={reasonId}
          onChange={(e) => setReasonId(e.target.value)}
          required
        >
          <MenuItem value="">Select Issue</MenuItem>
          {reasons.map((r) => (
            <MenuItem key={r.id} value={r.id}>
              {r.reason_name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Detailed Complaint"
          fullWidth
          margin="normal"
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate("/complaints")}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default NewComplaint;
