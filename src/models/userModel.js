const pool = require("../utils/db");

async function getUserByEmail(email) {
  const q =
    "SELECT id, email, first_name, last_name, password, balance, profile_image FROM users WHERE email = $1";
  const res = await pool.query(q, [email]);
  return res.rows[0];
}

async function createUser({ email, first_name, last_name, password }) {
  const q = `INSERT INTO users (email, first_name, last_name, password)
             VALUES ($1, $2, $3, $4)
             RETURNING id, email, first_name, last_name, balance, profile_image, created_at`;
  const res = await pool.query(q, [email, first_name, last_name, password]);
  return res.rows[0];
}

async function getUserById(id) {
  const q =
    "SELECT id, email, first_name, last_name, balance, profile_image FROM users WHERE id = $1";
  const res = await pool.query(q, [id]);
  return res.rows[0];
}

async function updateProfileImage(userId, url) {
  const q =
    "UPDATE users SET profile_image = $1 WHERE id = $2 RETURNING id, email, first_name, last_name, profile_image";
  const res = await pool.query(q, [url, userId]);
  return res.rows[0];
}

module.exports = {
  getUserByEmail,
  createUser,
  getUserById,
  updateProfileImage,
};
