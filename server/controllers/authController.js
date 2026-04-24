const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyCaptcha } = require("../utils/captcha");

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_123";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });

exports.registerUser = async (req, res) => {
  try {
    const { email, password, captchaId, captchaAnswer } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const captchaResult = await verifyCaptcha(captchaId, captchaAnswer);
    if (!captchaResult.valid) {
      if (captchaResult.reason === "incorrect") {
        return res.status(400).json({ message: "Incorrect CAPTCHA" });
      }
      return res.status(400).json({ message: "Captcha expired or invalid" });
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const admin = await Admin.create({
      email: email.toLowerCase(),
      password: hashedPassword
    });

    res.status(201).json({
      message: "Admin registered successfully",
      token: signToken(admin._id),
      admin: {
        id: admin._id,
        email: admin.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password, captchaId, captchaAnswer } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const captchaResult = await verifyCaptcha(captchaId, captchaAnswer);
    if (!captchaResult.valid) {
      if (captchaResult.reason === "incorrect") {
        return res.status(400).json({ message: "Incorrect CAPTCHA" });
      }
      return res.status(400).json({ message: "Captcha expired or invalid" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(admin._id);

    res.json({
      token,
      admin: {
        id: admin._id,
        email: admin.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Backward-compatible aliases for existing imports/usages
exports.register = exports.registerUser;
exports.login = exports.loginUser;