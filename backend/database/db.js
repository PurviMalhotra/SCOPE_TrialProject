const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME || "scope_event_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

async function connectDb() {
  const client = await pool.connect();

  try {
    await client.query("SELECT 1");

    console.log(
      `Connected to PostgreSQL -> ${
        process.env.DB_NAME || "scope_event_db"
      }`
    );

    return true;
  } catch (err) {
    console.error("Database connection failed:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

async function testConnection() {
  return connectDb();
}

async function query(sql, params = []) {
  try {
    return await pool.query(sql, params);
  } catch (err) {
    console.error("Query error:", err.message, "| SQL:", sql);
    throw err;
  }
}

async function withTransaction(fn) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await fn(client);

    await client.query("COMMIT");

    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

process.on("SIGINT", () => {
  pool.end(() => process.exit(0));
});

process.on("SIGTERM", () => {
  pool.end(() => process.exit(0));
});

module.exports = {
  pool,
  query,
  withTransaction,
  testConnection,
  connectDb,
};