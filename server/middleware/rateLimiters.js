const rateLimit = require("express-rate-limit");

const rateLimitMessage = (message) => ({
  message: { message },
  standardHeaders: true,
  legacyHeaders: false,
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  ...rateLimitMessage("Too many requests from this IP, please try again later."),
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  ...rateLimitMessage("Too many login attempts, please try again later."),
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  ...rateLimitMessage("Too many registration attempts, please try again later."),
});

const captchaGetLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  ...rateLimitMessage("Too many CAPTCHA requests, please slow down."),
});

const captchaVerifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  ...rateLimitMessage("Too many CAPTCHA verification attempts, please slow down."),
});

const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  ...rateLimitMessage("Too many export requests, please try again later."),
});

module.exports = {
  globalLimiter,
  loginLimiter,
  registerLimiter,
  captchaGetLimiter,
  captchaVerifyLimiter,
  exportLimiter,
};