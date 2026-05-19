const jwt = require("jsonwebtoken");
const env = require("../config/env");

const signToken = (user) => {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      role: user.role,
      name: user.name,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

module.exports = {
  signToken,
  verifyToken,
};
