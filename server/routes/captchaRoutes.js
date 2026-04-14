const express = require("express");
const router = express.Router();

const captchaController = require("../controllers/captchaController");

router.get("/captcha", captchaController.getCaptcha);
router.post("/captcha/verify", captchaController.verifyCaptchaAnswer);
router.get("/api/captcha", captchaController.getCaptcha);
router.post("/api/captcha/verify", captchaController.verifyCaptchaAnswer);

module.exports = router;
