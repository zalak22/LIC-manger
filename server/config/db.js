const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.mongodb+srv://zalakraj1_db_user:monogoDC3m5@cluster0.8s24sox.mongodb.net/?appName=Cluster0);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;