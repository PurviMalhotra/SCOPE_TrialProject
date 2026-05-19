// database/db.js
// PostgreSQL connection pool using pg + dotenv
// Matches _pg_env.sh environment variable names

import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host:     process.env.DB_HOST     || '127.0.0.1',
  port:     parseInt(process.env.DB_PORT || '5433', 10),
  database: process.env.DB_NAME     || 'scope_event_db',
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  // Connection pool settings (tune as needed)
  max: 10,               // max simultaneous connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  }
  console.log(`Connected to PostgreSQL at ${process.env.DB_HOST}:${process.env.DB_PORT} → ${process.env.DB_NAME}`);
  release();
});

// Graceful shutdown
process.on('SIGINT',  () => pool.end(() => process.exit(0)));
process.on('SIGTERM', () => pool.end(() => process.exit(0)));

/**
 * Run a parameterised query.
 * Usage: const { rows } = await query('SELECT * FROM users WHERE user_id = $1', [id]);
 */
export async function query(sql, params = []) {
  try {
    return await pool.query(sql, params);
  } catch (err) {
    console.error('Query error:', err.message, '| SQL:', sql);
    throw err;
  }
}

/**
 * Run multiple queries in a single transaction.
 * Usage: await withTransaction(async (client) => { await client.query(...) });
 */
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export default pool;
