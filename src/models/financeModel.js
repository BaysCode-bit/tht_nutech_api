const pool = require("../utils/db");

async function getUserByEmail(email) {
  const q = `
    SELECT id, email, first_name, last_name, profile_image, balance
    FROM users
    WHERE email = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [email]);
  return rows[0] || null;
}

async function getUserById(userId) {
  const q = `SELECT id, email, first_name, last_name, profile_image, balance FROM users WHERE id = $1 LIMIT 1`;
  const { rows } = await pool.query(q, [userId]);
  return rows[0] || null;
}

async function insertTopUpTransaction({
  user_id,
  amount,
  description = "Top Up balance",
}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const invoice_number =
      "INV" + Date.now() + Math.floor(Math.random() * 1000);

    const insertSQL = `
      INSERT INTO transactions
        (invoice_number, user_id, transaction_type, service_code, service_name, amount, total_amount, description, created_on)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id, invoice_number, transaction_type, amount, total_amount, created_on
    `;
    const params = [
      invoice_number,
      user_id,
      "TOPUP",
      null,
      null,
      amount,
      amount,
      description,
    ];
    const insertRes = await client.query(insertSQL, params);

    await client.query(
      "UPDATE users SET balance = balance + $1 WHERE id = $2",
      [amount, user_id]
    );

    await client.query("COMMIT");

    return insertRes.rows[0];
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

async function createPaymentTransaction({
  user_id,
  service_code,
  service_name = null,
  amount,
  description = null,
}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const balQ = "SELECT balance FROM users WHERE id = $1 FOR UPDATE";
    const balRes = await client.query(balQ, [user_id]);
    const row = balRes.rows[0];
    if (!row) {
      throw new Error("USER_NOT_FOUND");
    }
    const currentBalance = Number(row.balance || 0);

    if (Number(amount) > currentBalance) {
      throw new Error("INSUFFICIENT_BALANCE");
    }

    const invoice_number =
      "INV" + Date.now() + Math.floor(Math.random() * 1000);

    const insertSQL = `
      INSERT INTO transactions
        (invoice_number, user_id, transaction_type, service_code, service_name, amount, total_amount, description, created_on)
      VALUES
        ($1, $2, $3, $4, $5, $6, $6, $7, NOW())
      RETURNING id, invoice_number, transaction_type, service_code, service_name, amount, total_amount, description, created_on
    `;
    const params = [
      invoice_number,
      user_id,
      "PAYMENT",
      service_code,
      service_name,
      amount,
      description,
    ];
    const insertRes = await client.query(insertSQL, params);

    await client.query(
      "UPDATE users SET balance = balance - $1 WHERE id = $2",
      [amount, user_id]
    );

    await client.query("COMMIT");

    return insertRes.rows[0];
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

async function getBalanceByUserId(user_id) {
  const q = "SELECT balance FROM users WHERE id = $1";
  const { rows } = await pool.query(q, [user_id]);
  return rows[0] ? Number(rows[0].balance) : null;
}

async function getTransactionHistory(user_id, offset = 0, limit = 10) {
  // Ensure numbers
  offset = Number.isFinite(Number(offset)) ? Number(offset) : 0;
  limit = Number.isFinite(Number(limit)) ? Number(limit) : 10;

  const q = `
    SELECT invoice_number, transaction_type, service_code, service_name, description, amount AS total_amount, created_on
    FROM transactions
    WHERE user_id = $1
    ORDER BY created_on DESC
    OFFSET $2 LIMIT $3
  `;
  const { rows } = await pool.query(q, [user_id, offset, limit]);
  return { offset, limit, records: rows };
}

module.exports = {
  getUserByEmail,
  getUserById,
  insertTopUpTransaction,
  createPaymentTransaction,
  getBalanceByUserId,
  getTransactionHistory,
};
