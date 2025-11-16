const express = require("express");
const router = express.Router();

const financeController = require("../controllers/financeController");

const auth = require("../middlewares/auth");

router.post("/", auth, financeController.createTransaction);

router.get("/history", auth, financeController.getHistory);

module.exports = router;
