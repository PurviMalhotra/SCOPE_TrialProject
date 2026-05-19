const AppError = require("../utils/AppError");

const validate = (schema) => (req, res, next) => {
  const result = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: false,
  });

  if (result.error) {
    const details = result.error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return next(new AppError("Validation failed", 400, details));
  }

  req.body = result.value;
  return next();
};

module.exports = validate;
