const requiredString = (value) => typeof value === "string" && value.trim().length > 0;

const validateEventRequestBody = (body) => {
  const errors = [];
  const requiredFields = [
    "lectureType",
    "lectureTitle",
    "courseCode",
    "courseTitle",
    "expertName",
  ];

  requiredFields.forEach((field) => {
    if (!requiredString(body[field])) {
      errors.push({
        path: [field],
        message: `${field} is required`,
      });
    }
  });

  if (!Array.isArray(body.faculty) || body.faculty.length === 0) {
    errors.push({
      path: ["faculty"],
      message: "faculty must include at least one member",
    });
  }

  return errors;
};

const eventRequestSchema = {
  validate(body) {
    const details = validateEventRequestBody(body || {});

    if (details.length) {
      return {
        error: { details },
        value: body,
      };
    }

    return {
      value: body,
    };
  },
};

module.exports = {
  eventRequestSchema,
};
