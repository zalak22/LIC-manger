const express = require("express");
const router = express.Router();

const exportController = require("../controllers/exportController");
const authMiddleware = require("../middleware/authMiddleware");

router.get(
  "/export/excel/:policyId",
  authMiddleware,
  exportController.exportPolicyExcel
);

router.get(
  "/api/export/excel/:policyId",
  authMiddleware,
  exportController.exportPolicyExcel
);

module.exports = router;