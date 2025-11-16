const express = require("express");
const router = express.Router();
const otherCtrl = require("../controllers/otherController");
const auth = require("../middlewares/auth");

router.get("/banner", otherCtrl.getBanners); // public
router.get("/services", auth, otherCtrl.getServices); // private

module.exports = router;
