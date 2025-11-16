const pool = require("../utils/db");
const path = require("path");
const fs = require("fs");

exports.getProfile = async (req, res) => {
  try {
    const email = req.user && req.user.email;
    if (!email) {
      return res.status(400).json({
        status: 101,
        message: "Email tidak ditemukan di token",
        data: null,
      });
    }

    const sql =
      "SELECT email, first_name, last_name, profile_image FROM users WHERE email = $1 LIMIT 1";
    const { rows } = await pool.query(sql, [email]);

    if (!rows || rows.length === 0) {
      return res
        .status(404)
        .json({ status: 101, message: "User tidak ditemukan", data: null });
    }

    return res
      .status(200)
      .json({ status: 0, message: "Sukses", data: rows[0] });
  } catch (err) {
    console.error("getProfile error", err);
    return res
      .status(500)
      .json({ status: 500, message: "Server error", data: null });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 102,
        message: "Format Image tidak sesuai",
        data: null,
      });
    }

    const email = req.user && req.user.email;
    if (!email) {
      return res.status(400).json({
        status: 101,
        message: "Email tidak ditemukan di token",
        data: null,
      });
    }

    const filePath = `/uploads/${req.file.filename}`;

    const sql =
      "UPDATE users SET profile_image = $1 WHERE email = $2 RETURNING email, first_name, last_name, profile_image";
    const { rows } = await pool.query(sql, [filePath, email]);

    if (!rows || rows.length === 0) {
      return res
        .status(404)
        .json({ status: 101, message: "User tidak ditemukan", data: null });
    }

    return res.status(200).json({
      status: 0,
      message: "Update Profile Image berhasil",
      data: rows[0],
    });
  } catch (err) {
    console.error("uploadProfileImage error", err);
    return res
      .status(500)
      .json({ status: 500, message: "Server error", data: null });
  }
};
