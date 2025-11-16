const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const m = authHeader.match(/^Bearer (.+)$/);
  if (!m)
    return res
      .status(401)
      .json({ status: 401, message: "Token tidak disertakan", data: null });

  const token = m[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    console.error("auth middleware jwt verify error", err);
    return res.status(401).json({
      status: 108,
      message: "Token tidak valid atau kadaluwarsa",
      data: null,
    });
  }
};
