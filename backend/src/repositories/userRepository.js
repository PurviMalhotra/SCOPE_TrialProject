// =============================================================================
// repositories/userRepository.js
//
// PostgreSQL-backed persistence for application users.
// Replaces the previous in-memory (array) implementation.
//
// Preserved interface:
//   findById(id)                  → returns user or null
//   findByEmail(email)            → returns user or null
//   findByGoogleId(googleId)      → returns user or null
//   upsertFromGoogle(profile)     → create-or-update OAuth user, returns user
//
// Returned user object shape (unchanged from in-memory, used by signToken):
//   { id, email, name, role, googleId, picture, createdAt, updatedAt }
//
// DB ↔ In-memory field mapping:
//   user_id    → id
//   full_name  → name
//   google_id  → googleId
//   picture    → picture
//   role       → role   (DB ENUM: faculty|hod|dean|scope_admin)
//   created_at → createdAt
//   updated_at → updatedAt
//
// Role note:
//   The old in-memory code used ROLES.USER = 'USER' which is not a valid
//   DB ENUM value. Google OAuth users are provisioned as 'faculty' by default,
//   which is the correct domain role for a new VIT faculty member logging in.
//   Existing seeded users (hod, dean, scope_admin) retain their DB roles.
// =============================================================================

const { query } = require("../../database/db");

/**
 * Maps a raw DB row to the camelCase shape expected by the auth layer.
 * Preserves full compatibility with signToken() and authMiddleware.
 */
const toUser = (row) => ({
  id:        row.user_id,
  email:     row.email,
  name:      row.full_name,
  role:      row.role,
  googleId:  row.google_id  ?? undefined,
  picture:   row.picture    ?? undefined,
  createdAt: row.created_at instanceof Date
               ? row.created_at.toISOString()
               : row.created_at,
  updatedAt: row.updated_at instanceof Date
               ? row.updated_at.toISOString()
               : row.updated_at,
});

/**
 * Find a user by their primary key (user_id).
 *
 * @param {number|string} id
 * @returns {Promise<object|null>}
 */
const findById = async (id) => {
  const result = await query(
    `SELECT * FROM users WHERE user_id = $1 LIMIT 1`,
    [id]
  );
  return result.rows.length ? toUser(result.rows[0]) : null;
};

/**
 * Find a user by email address.
 *
 * @param {string} email
 * @returns {Promise<object|null>}
 */
const findByEmail = async (email) => {
  const result = await query(
    `SELECT * FROM users WHERE email = $1 LIMIT 1`,
    [email]
  );
  return result.rows.length ? toUser(result.rows[0]) : null;
};

/**
 * Find a user by their Google OAuth subject ID.
 *
 * @param {string} googleId
 * @returns {Promise<object|null>}
 */
const findByGoogleId = async (googleId) => {
  const result = await query(
    `SELECT * FROM users WHERE google_id = $1 LIMIT 1`,
    [googleId]
  );
  return result.rows.length ? toUser(result.rows[0]) : null;
};

/**
 * Create or update a user from a Google OAuth profile.
 *
 * Lookup priority:
 *  1. google_id (most reliable — persistent across email changes)
 *  2. email     (fallback for users created before google_id column existed)
 *
 * If found   → update google_id, picture, full_name; preserve role.
 * If not found → insert with role 'faculty' (default for new OAuth users).
 *
 * @param {object} profile
 * @param {string} profile.googleId
 * @param {string} profile.email
 * @param {string} profile.name
 * @param {string} [profile.picture]
 * @returns {Promise<object>} The upserted user
 */
const upsertFromGoogle = async (profile) => {
  // Try google_id first, then email
  let existing = null;
  if (profile.googleId) {
    existing = await findByGoogleId(profile.googleId);
  }
  if (!existing && profile.email) {
    existing = await findByEmail(profile.email);
  }

  if (existing) {
    // Update mutable OAuth fields; preserve role and email
    const result = await query(
      `UPDATE users
       SET google_id  = COALESCE($1, google_id),
           picture    = COALESCE($2, picture),
           full_name  = COALESCE($3, full_name),
           updated_at = NOW()
       WHERE user_id = $4
       RETURNING *`,
      [
        profile.googleId ?? null,
        profile.picture  ?? null,
        profile.name     ?? null,
        existing.id,
      ]
    );
    return toUser(result.rows[0]);
  }

  // New OAuth user — default role is 'faculty'
  const result = await query(
    `INSERT INTO users (email, full_name, role, google_id, picture)
     VALUES ($1, $2, 'faculty', $3, $4)
     RETURNING *`,
    [
      profile.email,
      profile.name    ?? profile.email,
      profile.googleId ?? null,
      profile.picture  ?? null,
    ]
  );
  return toUser(result.rows[0]);
};

module.exports = {
  findById,
  findByEmail,
  findByGoogleId,
  upsertFromGoogle,
};
