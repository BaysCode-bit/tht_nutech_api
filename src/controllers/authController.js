const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getUserByEmail, createUser } = require("../models/userModel");

const SALT_ROUNDS = 10;

exports.register = async (req, res) => {
  const { email, first_name, last_name, password } = req.body;

  if (!email || !first_name || !password) {
    return res
      .status(400)
      .json({ status: 102, message: "Missing required fields", data: null });
  }
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: 102,
      message: "Paramter email tidak sesuai format",
      data: null,
    });
  }
  if (password.length < 8) {
    return res.status(400).json({
      status: 102,
      message: "Password minimal 8 karakter",
      data: null,
    });
  }

  try {
    const existing = await getUserByEmail(email);
    if (existing) {
      return res
        .status(400)
        .json({ status: 103, message: "Email sudah terdaftar", data: null });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    await createUser({ email, first_name, last_name, password: hashed });
    return res.status(200).json({
      status: 0,
      message: "Registrasi berhasil silahkan login",
      data: null,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: 500, message: "Server error", data: null });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const emailRegex = /\S+@\S+\.\S+/;
  if (!email || !password) {
    return res.status(400).json({
      status: 103,
      message: "Username atau password salah",
      data: null,
    });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: 102,
      message: "Paramter email tidak sesuai format",
      data: null,
    });
  }
  try {
    const user = await getUserByEmail(email);
    if (!user)
      return res.status(401).json({
        status: 103,
        message: "Username atau password salah",
        data: null,
      });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({
        status: 103,
        message: "Username atau password salah",
        data: null,
      });

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "12h",
    });

    const responseUser = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      balance: user.balance,
      profile_image: user.profile_image,
    };

    return res.status(200).json({
      status: 0,
      message: "Login Sukses",
      data: { token, user: responseUser },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: 500, message: "Server error", data: null });
  }
};
