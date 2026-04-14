const express = require("express");
const router = express.Router();

const captchaController = require("../controllers/captchaController");

router.get("/api/captcha", captchaController.getCaptcha);

module.exports = router;
