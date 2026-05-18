const asyncHandler = require("../utils/asyncHandler");
const response = require("../utils/response");
const uploadService = require("../services/uploadService");

const uploadFile = asyncHandler(async (req, res) => {
  const upload = await uploadService.uploadFile(
    req.file,
    req.body?.documentType,
    req.user
  );

  return response.created(res, upload, "File uploaded");
});

module.exports = {
  uploadFile,
};
