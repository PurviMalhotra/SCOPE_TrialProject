const extractTextFromFile = require("./pdfParserService");
const analyzeResumeWithGemini = require("./geminiService");
const { getResumeQueue } = require("../queues/resumeQueue");
const uploadService = require("./uploadService");
const AppError = require("../utils/AppError");

const mapParsedDataToFormFields = (parsedData) => ({
  expertName: parsedData.name || "",
  designation: parsedData.designation || "",
  company: parsedData.companyName || "",
  address: parsedData.address || "",
  mobile: parsedData.mobileNumber || "",
  email: parsedData.officialEmail || "",
  whatsapp: parsedData.whatsappNumber || parsedData.mobileNumber || "",
  experience: parsedData.yearsOfExperience || "",
});

const parseUploadedResume = async (file) => {
  if (!file) {
    throw new AppError("No file uploaded", 400);
  }

  const rawText = await extractTextFromFile(file);

  if (!rawText.trim()) {
    throw new AppError("Could not extract text from the file.", 400);
  }

  const parsedData = await analyzeResumeWithGemini(rawText);

  return {
    parsedData,
    mappedFormFields: mapParsedDataToFormFields(parsedData),
  };
};

const createParseJobFromUpload = async (uploadId, actor) => {
  if (!uploadId) {
    throw new AppError("uploadId is required", 400);
  }

  const upload = await uploadService.getUploadById(uploadId);
  const queue = getResumeQueue();
  const job = await queue.add({
    uploadId: upload.id,
    bucket: upload.bucket,
    objectKey: upload.objectKey,
    originalName: upload.originalName,
    mimeType: upload.mimeType,
    requestedBy: actor?.id,
  });

  return {
    jobId: job.id,
    status: "queued",
    upload,
  };
};

const getParseJob = async (jobId) => {
  if (!jobId) {
    throw new AppError("jobId is required", 400);
  }

  const queue = getResumeQueue();
  const job = await queue.getJob(jobId);

  if (!job) {
    throw new AppError("Resume parse job not found", 404);
  }

  const state = await job.getState();
  const result = job.returnvalue || null;
  const failedReason = job.failedReason || null;

  return {
    jobId: job.id,
    status: state,
    progress: job.progress(),
    result,
    failedReason,
  };
};

module.exports = {
  parseUploadedResume,
  createParseJobFromUpload,
  getParseJob,
  mapParsedDataToFormFields,
};
