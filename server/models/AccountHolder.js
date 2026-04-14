const mongoose = require("mongoose");

const accountHolderSchema = new mongoose.Schema({
  adminId: { type: String, required: true },
  firstName: { type: String, required: true },
  secondName: String,
  accountNumber1: { type: String, required: true },
  accountNumber2: String,
  cifNumber1: { type: String, required: true },
  cifNumber2: String,
  mobileNumber: String,
  nomineeName: { type: String, required: true },
  accountType: { type: String, enum: ["First Slot", "Second Slot"] },
  totalInvestmentAmount: { type: Number, default: 0 },
  leftInvestmentAmount: { type: Number, default: 0 }
}, { timestamps: true });

// Keep storing data in existing "users" collection.
module.exports = mongoose.model("AccountHolder", accountHolderSchema, "users");
