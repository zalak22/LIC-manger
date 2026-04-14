const Installment = require("../models/Installment");
const Policy = require("../models/Policy");

const {
  parseDateFlexible,
  monthsBetweenInclusiveMinusOne
} = require("../utils/dateUtils");

const {
  recalcLeftInvestmentAmount,
  assertUserOwnedByAdmin
} = require("../utils/investmentUtils");

exports.generateInstallments = async (req, res) => {

  try {

    const policy = await Policy.findById(req.params.policyId).populate("userId");

    if (!policy || policy.userId.adminId !== req.admin.id)
      return res.status(403).json({ message: "Unauthorized" });

    if (policy.installmentsGenerated)
      return res.status(400).json({
        message: "Installments already generated"
      });

    const startDate = parseDateFlexible(policy.policyOpendate);

    const endDate = parseDateFlexible(policy.PolicyCloseDate);

    const installments = [];

    for (const { monthName, year } of monthsBetweenInclusiveMinusOne(startDate, endDate)) {

      installments.push({
        userId: policy.userId._id,
        policyId: policy._id,
        month: monthName,
        year,
        amount: policy.monthlyAmount,
        paid: false
      });

    }

    await Installment.insertMany(installments);

    policy.installmentsGenerated = true;

    await policy.save();

    res.json({
      message: "Installments generated",
      count: installments.length
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

exports.getPolicyInstallments = async (req, res) => {

  try {

    const installments = await Installment.find({
      policyId: req.params.policyId
    }).sort({ year: 1 });

    res.json(installments);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

exports.updateInstallment = async (req, res) => {

  try {

    const { amount, paid } = req.body;

    const installment = await Installment.findById(req.params.id);

    if (!installment)
      return res.status(404).json({ message: "Installment not found" });

    const user = await assertUserOwnedByAdmin(
      installment.userId,
      req.admin.id
    );

    if (!user)
      return res.status(403).json({ message: "Unauthorized" });

    if (amount !== undefined) installment.amount = amount;

    if (paid !== undefined) installment.paid = paid;

    await installment.save();

    await recalcLeftInvestmentAmount(
      installment.userId,
      installment.policyId
    );

    res.json(installment);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

exports.deletePolicyInstallments = async (req, res) => {

  try {

    const policy = await Policy.findById(req.params.policyId).populate("userId");

    if (!policy || policy.userId.adminId !== req.admin.id)
      return res.status(403).json({ message: "Unauthorized" });

    await Installment.deleteMany({
      policyId: req.params.policyId
    });

    policy.installmentsGenerated = false;

    await policy.save();

    await recalcLeftInvestmentAmount(
      policy.userId._id,
      policy._id
    );

    res.json({
      message: "All installments deleted"
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};