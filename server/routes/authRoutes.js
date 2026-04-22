const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/api/auth/register", authController.registerUser);
router.post("/api/auth/login", authController.loginUser);
router.get("/api/auth/profile", authMiddleware, authController.getProfile);
router.post("/auth/register", authController.registerUser);
router.post("/auth/login", authController.loginUser);
router.get("/auth/profile", authMiddleware, authController.getProfile);

module.exports = router;