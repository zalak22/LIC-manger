const { randomUUID } = require("crypto");

const CAPTCHA_TTL_MS = 3 * 60 * 1000; // 3 minutes
const captchaStore = new Map();

function generateCaptcha() {
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  const operator = Math.random() < 0.5 ? "+" : "-";

  return {
    question: `${a} ${operator} ${b} = ?`,
    answer: operator === "+" ? a + b : a - b
  };
}

function createCaptcha() {
  const { question, answer } = generateCaptcha();
  const captchaId = randomUUID();

  captchaStore.set(captchaId, {
    answer,
    expiresAt: Date.now() + CAPTCHA_TTL_MS
  });

  return { captchaId, question };
}

function verifyCaptcha(captchaId, captchaAnswer) {
  if (!captchaId || captchaAnswer === undefined || captchaAnswer === null) {
    return { valid: false, reason: "missing" };
  }

  const entry = captchaStore.get(captchaId);
  captchaStore.delete(captchaId); // one-time use

  if (!entry || entry.expiresAt < Date.now()) {
    return { valid: false, reason: "expired_or_invalid" };
  }

  const numericAnswer = Number(captchaAnswer);
  if (Number.isNaN(numericAnswer) || numericAnswer !== entry.answer) {
    return { valid: false, reason: "incorrect" };
  }

  return { valid: true };
}

setInterval(() => {
  const now = Date.now();
  for (const [captchaId, entry] of captchaStore.entries()) {
    if (entry.expiresAt < now) captchaStore.delete(captchaId);
  }
}, 60 * 1000).unref();

module.exports = {
  createCaptcha,
  verifyCaptcha
};
