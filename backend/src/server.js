const express = require("express");
const cors = require("cors");
const path = require("path"); // ✅ Import path (Required for serving files)
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const reasonsRoutes = require("./routes/reasons.routes");
const complaintsRoutes = require("./routes/complaints.routes");
const usersRoutes = require("./routes/users.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const activityRoutes = require("./routes/activity.routes");

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// 📂 SERVE STATIC FILES (Images/PDFs)
// ==========================================
// This allows the frontend to view the uploaded files at http://localhost:5000/uploads/...
app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); 
// Note: Adjusted path to "../uploads" assuming server.js is in /src and uploads is in /backend root.
// If your uploads folder is inside src, change to: path.join(__dirname, "uploads")

app.get("/", (req, res) => {
  res.json({ message: "Corporator Issue System API running" });
});

// ==========================================
// 🔗 API ROUTES
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/reasons", reasonsRoutes);
app.use("/api/complaints", complaintsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/activity", activityRoutes);

// ✅ NEW: Complaint Documents Route
app.use("/api/complaint-documents", require("./routes/complaintDocument.routes"));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});