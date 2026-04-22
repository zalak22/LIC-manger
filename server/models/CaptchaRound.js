const mongoose = require("mongoose");

const captchaRoundSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    answer: { type: Number, required: true },
    expiresAt: { type: Date, required: true }
  },
  {
    versionKey: false
  }
);

captchaRoundSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("CaptchaRound", captchaRoundSchema);
