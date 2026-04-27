const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimiters");

router.post("/api/auth/register", registerLimiter, authController.registerUser);
router.post("/api/auth/login", loginLimiter, authController.loginUser);
router.get("/api/auth/profile", authMiddleware, authController.getProfile);
router.post("/auth/register", registerLimiter, authController.registerUser);
router.post("/auth/login", loginLimiter, authController.loginUser);
router.get("/auth/profile", authMiddleware, authController.getProfile);

module.exports = router;