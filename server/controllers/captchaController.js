const { createCaptcha } = require("../utils/captcha");

exports.getCaptcha = async (req, res) => {
  try {
    const captcha = createCaptcha();
    res.json(captcha);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
