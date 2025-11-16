const express = require("express");
const router = express.Router();
const financeController = require("../controllers/financeController");
const authMiddleware = require("../middlewares/auth");

router.post("/topup", authMiddleware, financeController.topUp);
router.get("/balance", authMiddleware, financeController.getBalance);
router.post(
  "/transaction",
  authMiddleware,
  financeController.createTransaction
);
router.get(
  "/transaction/history",
  authMiddleware,
  financeController.getHistory
);

module.exports = router;
