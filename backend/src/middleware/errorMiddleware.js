const env = require("../config/env");
const logger = require("../utils/logger");

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    logger.error(err.stack || err.message);
  }

  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal server error",
    details: err.details || undefined,
    stack: env.nodeEnv === "production" ? undefined : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
