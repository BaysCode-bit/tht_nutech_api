require("dotenv").config();
const pool = require("../src/utils/db");

(async () => {
  try {
    console.log(
      "dotenv DATABASE_URL =",
      process.env.DATABASE_URL ? "OK (hidden)" : "MISSING"
    );

    try {
      console.log(
        "pool.options.connectionString =",
        pool.options && pool.options.connectionString
          ? "(present)"
          : "(not present)"
      );
    } catch (e) {
      console.log("cannot read pool.options.connectionString", e.message);
    }

    const cur = await pool.query(
      "SELECT current_database() AS db, current_schema() AS schema_name;"
    );
    console.log("DB INFO:", cur.rows);

    const email = "testuser1@mail.com";
    const q = await pool.query(
      "SELECT id, email, balance FROM users WHERE email = $1 LIMIT 1",
      [email]
    );
    console.log(`Query by exact email (${email}) returned:`, q.rows);

    const q2 = await pool.query(
      "SELECT id, email, balance FROM users WHERE email ILIKE $1 LIMIT 1",
      [email]
    );
    console.log(`Query ILIKE (${email}) returned:`, q2.rows);

    await pool.end();
    console.log("Done.");
    process.exit(0);
  } catch (err) {
    console.error("TEST DB ERROR:", err);
    try {
      await pool.end();
    } catch (_) {}
    process.exit(1);
  }
})();
