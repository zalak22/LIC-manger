const express = require("express");
const router = express.Router();

const exportController = require("../controllers/exportController");
const authMiddleware = require("../middleware/authMiddleware");
const { exportLimiter } = require("../middleware/rateLimiters");

router.get(
  "/export/excel/:policyId",
  authMiddleware,
  exportLimiter,
  exportController.exportPolicyExcel
);

router.get(
  "/api/export/excel/:policyId",
  authMiddleware,
  exportLimiter,
  exportController.exportPolicyExcel
);

module.exports = router;