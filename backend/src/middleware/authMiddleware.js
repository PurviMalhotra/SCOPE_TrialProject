const ROLES = require("../constants/roles");
const AppError = require("../utils/AppError");
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
      req.authError = err;
      return next();
    }
  }

  if (req.header("x-user-id")) {
    req.user = {
      id: req.header("x-user-id"),
      email: req.header("x-user-email") || "dev-user@example.com",
      role: req.header("x-user-role") || ROLES.USER,
      name: req.header("x-user-name") || "Development User",
    };
  }

  next();
};

const requireAuth = (req, res, next) => {
  if (req.user) {
    return next();
  }

  if (req.authError) {
    return next(new AppError("Invalid or expired authentication token", 401));
  }

  return next(new AppError("Authentication required", 401));
};

module.exports = {
  attachUser,
  requireAuth,
};
