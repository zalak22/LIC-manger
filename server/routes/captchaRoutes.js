const express = require("express");
const router = express.Router();

const captchaController = require("../controllers/captchaController");
const {
	captchaGetLimiter,
	captchaVerifyLimiter,
} = require("../middleware/rateLimiters");

router.get("/captcha", captchaGetLimiter, captchaController.getCaptcha);
router.post(
	"/captcha/verify",
	captchaVerifyLimiter,
	captchaController.verifyCaptchaAnswer
);
router.get("/api/captcha", captchaGetLimiter, captchaController.getCaptcha);
router.post(
	"/api/captcha/verify",
	captchaVerifyLimiter,
	captchaController.verifyCaptchaAnswer
);

module.exports = router;
