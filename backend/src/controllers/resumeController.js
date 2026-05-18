const asyncHandler = require("../utils/asyncHandler");
const response = require("../utils/response");
const resumeService = require("../services/resumeService");

const parseResume = asyncHandler(async (req, res) => {
  const result = await resumeService.parseUploadedResume(req.file);

  return res.json({
    success: true,
    data: result.parsedData,
    mappedFormFields: result.mappedFormFields,
  });
});

const createParseJob = asyncHandler(async (req, res) => {
  const job = await resumeService.createParseJobFromUpload(
    req.body.uploadId,
    req.user
  );

  return response.created(res, job, "Resume parse job queued");
});

const getParseJob = asyncHandler(async (req, res) => {
  const job = await resumeService.getParseJob(req.params.jobId);
  return response.success(res, job);
});

module.exports = {
  parseResume,
  createParseJob,
  getParseJob,
};
