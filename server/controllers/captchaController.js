const { createCaptcha, verifyCaptcha } = require("../utils/captcha");

exports.getCaptcha = async (req, res) => {
  try {
    const captcha = createCaptcha();
    res.json(captcha);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyCaptchaAnswer = async (req, res) => {
  try {
    const { captchaId, captchaAnswer } = req.body;
    const result = verifyCaptcha(captchaId, captchaAnswer);

    if (!result.valid) {
      return res.status(400).json({
        valid: false,
        message: result.reason === "incorrect" ? "Incorrect CAPTCHA" : "Captcha expired or invalid"
      });
    }

    res.json({ valid: true, message: "CAPTCHA verified" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
