require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const captchaRoutes = require("./routes/captchaRoutes");
const userRoutes = require("./routes/userRoutes");
const policyRoutes = require("./routes/policyRoutes");
const installmentRoutes = require("./routes/installmentRoutes");
const exportRoutes = require("./routes/exportRoutes");

const app = express();

app.use(express.json());
app.use(cors());

app.use(authRoutes);
app.use(captchaRoutes);
app.use(userRoutes);
app.use(policyRoutes);
app.use(installmentRoutes);
app.use(exportRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error"
  });
});

const PORT = process.env.PORT || 5000;

const MONGO_URI = process.env.MONGO_URI;


mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
  });