const AppError = require("../utils/AppError");

const authorize = (...roles) => (req, res, next) => {
  if (!roles.length || roles.includes(req.user?.role)) {
    return next();
  }

  return next(new AppError("Forbidden", 403));
};

module.exports = authorize;
