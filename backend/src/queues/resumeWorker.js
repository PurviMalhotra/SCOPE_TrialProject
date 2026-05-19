const path = require("path");
const { getMinioClient } = require("../config/minio");
const { getResumeQueue } = require("./resumeQueue");
const resumeService = require("../services/resumeService");
const logger = require("../utils/logger");

const streamToBuffer = async (stream) => {
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
};

const processResumeParseJob = async (job) => {
  const client = getMinioClient();
  const stream = await client.getObject(job.data.bucket, job.data.objectKey);
  const buffer = await streamToBuffer(stream);

  const file = {
    buffer,
    originalname: job.data.originalName || path.basename(job.data.objectKey),
    mimetype: job.data.mimeType,
    size: buffer.length,
  };

  await job.progress(40);
  const result = await resumeService.parseUploadedResume(file);
  await job.progress(100);

  return result;
};

const startResumeWorker = () => {
  const queue = getResumeQueue();

  queue.process(processResumeParseJob);

  queue.on("completed", (job) => {
    logger.info(`Resume parse job ${job.id} completed`);
  });

  queue.on("failed", (job, err) => {
    logger.error(`Resume parse job ${job?.id} failed`, err.message);
  });

  logger.info("Resume parse worker started");
  return queue;
};

if (require.main === module) {
  startResumeWorker();
}

module.exports = {
  startResumeWorker,
  processResumeParseJob,
};
