const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http"); // ✅ Added for Socket.io
const { Server } = require("socket.io"); // ✅ Added for Socket.io
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const reasonsRoutes = require("./routes/reasons.routes");
const complaintsRoutes = require("./routes/complaints.routes");
const usersRoutes = require("./routes/users.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const activityRoutes = require("./routes/activity.routes");
const officeRoutes = require("./routes/office.routes"); // ✅ ADDED: Office Routes

const app = express();
const server = http.createServer(app); // ✅ Wrap app with HTTP server for Socket.io

// ==========================================
// ⚡ SOCKET.IO SETUP
// ==========================================
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Matches your Vite frontend port
    methods: ["GET", "POST"]
  }
});

// Attach io to the app so it can be accessed in controllers via req.app.get("io")
app.set("io", io);

io.on("connection", (socket) => {
  console.log("⚡ User connected to Socket:", socket.id);
  
  // Join a room based on officeId to ensure isolated notifications
  socket.on("join_office", (officeId) => {
    socket.join(officeId);
    console.log(`🏢 User joined office room: ${officeId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected from Socket");
  });
});

app.use(cors());
app.use(express.json());

// ==========================================
// 📂 SERVE STATIC FILES (Images/PDFs)
// ==========================================
app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); 

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
app.use("/api/office", officeRoutes); // ✅ ADDED: Office Route entry point

// ✅ NEW: Complaint Documents Route
app.use("/api/complaint-documents", require("./routes/complaintDocument.routes"));

const PORT = process.env.PORT || 5000;

// ✅ IMPORTANT: Use server.listen instead of app.listen to enable Sockets
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});