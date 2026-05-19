const success = (res, data = null, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const created = (res, data = null, message = "Created") => {
  return success(res, data, message, 201);
};

module.exports = {
  success,
  created,
};
