const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const profileController = require("../controllers/profileController");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "public", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error("Format Image tidak sesuai"), false);
    }
    cb(null, true);
  },
});

router.get("/profile", auth, profileController.getProfile);
router.put(
  "/profile/image",
  auth,
  upload.single("file"),
  profileController.uploadProfileImage
);

module.exports = router;
