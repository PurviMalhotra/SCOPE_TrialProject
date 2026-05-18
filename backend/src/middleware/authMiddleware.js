const ROLES = require("../constants/roles");
const { verifyToken } = require("../utils/token");

const attachUser = (req, res, next) => {
  const authHeader = req.header("authorization") || "";
  const [, token] = authHeader.match(/^Bearer\s+(.+)$/i) || [];

  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        name: payload.name,
      };
      return next();
    } catch (err) {
      return next();
    }
  }

  req.user = {
    id: req.header("x-user-id") || "dev-user",
    email: req.header("x-user-email") || "dev-user@example.com",
    role: req.header("x-user-role") || ROLES.USER,
  };

  next();
};

module.exports = {
  attachUser,
};
