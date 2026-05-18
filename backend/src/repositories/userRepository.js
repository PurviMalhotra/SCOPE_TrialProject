const ROLES = require("../constants/roles");

let users = [];
let nextUserId = 1;

const findById = async (id) => {
  return users.find((user) => String(user.id) === String(id)) || null;
};

const findByEmail = async (email) => {
  return users.find((user) => user.email === email) || null;
};

const findByGoogleId = async (googleId) => {
  return users.find((user) => user.googleId === googleId) || null;
};

const upsertFromGoogle = async (profile) => {
  const existing =
    (profile.googleId && (await findByGoogleId(profile.googleId))) ||
    (profile.email && (await findByEmail(profile.email)));

  if (existing) {
    const updated = {
      ...existing,
      ...profile,
      id: existing.id,
      role: existing.role,
      updatedAt: new Date().toISOString(),
    };

    users = users.map((user) => (user.id === existing.id ? updated : user));
    return updated;
  }

  const now = new Date().toISOString();
  const user = {
    id: nextUserId,
    role: ROLES.USER,
    ...profile,
    createdAt: now,
    updatedAt: now,
  };

  nextUserId += 1;
  users = [user, ...users];
  return user;
};

module.exports = {
  findById,
  findByEmail,
  findByGoogleId,
  upsertFromGoogle,
};
