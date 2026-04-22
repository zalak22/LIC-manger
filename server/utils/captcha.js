const { randomUUID } = require("crypto");
const CaptchaRound = require("../models/CaptchaRound");

const CAPTCHA_TTL_MS = 3 * 60 * 1000; // 3 minutes

function generateCaptcha() {
  const operators = ["+", "-", "*", "/"];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  let num1 = Math.floor(Math.random() * 18) + 3; // 3 - 20
  let num2 = Math.floor(Math.random() * 10) + 1; // 1 - 10

  if (operator === "-") {
    if (num1 < num2) {
      [num1, num2] = [num2, num1];
    }
  }

  if (operator === "/") {
    num2 = Math.floor(Math.random() * 10) + 1;
    const quotient = Math.floor(Math.random() * 10) + 1;
    num1 = num2 * quotient;
  }

  const symbolMap = {
    "+": "+",
    "-": "-",
    "*": "x",
    "/": "/"
  };

  let answer = 0;
  if (operator === "+") answer = num1 + num2;
  if (operator === "-") answer = num1 - num2;
  if (operator === "*") answer = num1 * num2;
  if (operator === "/") answer = num1 / num2;

  return {
    question: `${num1} ${symbolMap[operator]} ${num2} = ?`,
    answer
  };
}

async function createCaptcha() {
  const { question, answer } = generateCaptcha();
  const captchaId = randomUUID();

  await CaptchaRound.create({
    _id: captchaId,
    answer,
    expiresAt: new Date(Date.now() + CAPTCHA_TTL_MS)
  });

  return { captchaId, question };
}

async function verifyCaptcha(captchaId, captchaAnswer) {
  if (!captchaId || captchaAnswer === undefined || captchaAnswer === null) {
    return { valid: false, reason: "missing" };
  }

  // Delete on lookup to enforce one-time use even when answer is incorrect.
  const entry = await CaptchaRound.findByIdAndDelete(captchaId).lean();

  if (!entry || new Date(entry.expiresAt).getTime() < Date.now()) {
    return { valid: false, reason: "expired_or_invalid" };
  }

  const numericAnswer = Number(captchaAnswer);
  if (Number.isNaN(numericAnswer) || numericAnswer !== entry.answer) {
    return { valid: false, reason: "incorrect" };
  }

  return { valid: true };
}

module.exports = {
  createCaptcha,
  verifyCaptcha
};
