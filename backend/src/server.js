const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const reasonsRoutes = require("./routes/reasons.routes");
const complaintsRoutes = require("./routes/complaints.routes");
const usersRoutes = require("./routes/users.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Corporator Issue System API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/reasons", reasonsRoutes);
app.use("/api/complaints", complaintsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
