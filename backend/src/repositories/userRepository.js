const { query } = require("../../database/db");
const ROLES = require("../constants/roles");

const USER_COLUMNS = `
  user_id, email, full_name, role, faculty_id,
  google_id, picture_url, created_at, updated_at
`;

const mapDbRoleToAppRole = (role) => {
  if (role === "scope_admin") return ROLES.ADMIN;
  if (role === "hod" || role === "dean") return ROLES.APPROVER;
  return ROLES.USER;
};

const mapUserRow = (row) => ({
  id: row.user_id,
  googleId: row.google_id || null,
  email: row.email,
  name: row.full_name,
  role: mapDbRoleToAppRole(row.role),
  picture: row.picture_url || null,
  facultyId: row.faculty_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const findById = async (id) => {
  const { rows } = await query(
    `SELECT ${USER_COLUMNS} FROM users WHERE user_id = $1`,
    [id]
  );
  return rows[0] ? mapUserRow(rows[0]) : null;
};

const findByEmail = async (email) => {
  const { rows } = await query(
    `SELECT ${USER_COLUMNS} FROM users WHERE LOWER(email) = LOWER($1)`,
    [email]
  );
  return rows[0] ? mapUserRow(rows[0]) : null;
};

const findByGoogleId = async (googleId) => {
  if (!googleId) return null;

  const { rows } = await query(
    `SELECT ${USER_COLUMNS} FROM users WHERE google_id = $1`,
    [googleId]
  );
  return rows[0] ? mapUserRow(rows[0]) : null;
};

const upsertFromGoogle = async (profile) => {
  const existingByGoogle = profile.googleId
    ? await findByGoogleId(profile.googleId)
    : null;
  const existingByEmail = profile.email
    ? await findByEmail(profile.email)
    : null;
  const existing = existingByGoogle || existingByEmail;

  if (existing) {
    const { rows } = await query(
      `UPDATE users SET
        email = $2,
        full_name = $3,
        google_id = COALESCE($4, google_id),
        picture_url = COALESCE($5, picture_url),
        updated_at = NOW()
      WHERE user_id = $1
      RETURNING ${USER_COLUMNS}`,
      [
        existing.id,
        profile.email || existing.email,
        profile.name || existing.name,
        profile.googleId || null,
        profile.picture || null,
      ]
    );

    return mapUserRow(rows[0]);
  }

  const { rows } = await query(
    `INSERT INTO users (email, full_name, role, google_id, picture_url)
     VALUES ($1, $2, 'faculty', $3, $4)
     RETURNING ${USER_COLUMNS}`,
    [profile.email, profile.name, profile.googleId || null, profile.picture || null]
  );

  return mapUserRow(rows[0]);
};

module.exports = {
  findById,
  findByEmail,
  findByGoogleId,
  upsertFromGoogle,
};
