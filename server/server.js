require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// routes
const authRoutes = require("./routes/authRoutes");
const captchaRoutes = require("./routes/captchaRoutes");
const userRoutes = require("./routes/userRoutes");
const policyRoutes = require("./routes/policyRoutes");
const installmentRoutes = require("./routes/installmentRoutes");
const exportRoutes = require("./routes/exportRoutes");
const { globalLimiter } = require("./middleware/rateLimiters");

const app = express();

// middleware
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(globalLimiter);

// routes
app.use(authRoutes);
app.use(captchaRoutes);
app.use(userRoutes);
app.use(policyRoutes);
app.use(installmentRoutes);
app.use(exportRoutes);

// test route (VERY IMPORTANT)
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

// env check (IMPORTANT)
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in environment variables");
  process.exit(1);
}

// connect DB + start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });