const path = require("path");
const { randomUUID } = require("crypto");
const env = require("../config/env");
const { getMinioClient } = require("../config/minio");
const AppError = require("../utils/AppError");
const uploadRepository = require("../repositories/uploadRepository");

const allowedDocumentTypes = new Set([
  "acceptance",
  "profile",
  "invitation",
  "resume",
]);

const buildObjectKey = (file, documentType) => {
  const ext = path.extname(file.originalname || "");
  const cleanType = documentType || "file";
  return `${cleanType}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${ext}`;
};

const buildPublicUrl = (bucket, objectKey) => {
  if (env.minio.publicBaseUrl) {
    return `${env.minio.publicBaseUrl.replace(/\/$/, "")}/${bucket}/${objectKey}`;
  }

  const protocol = env.minio.useSSL ? "https" : "http";
  return `${protocol}://${env.minio.endPoint}:${env.minio.port}/${bucket}/${objectKey}`;
};

const ensureBucket = async (client, bucket) => {
  const exists = await client.bucketExists(bucket);
  if (!exists) {
    await client.makeBucket(bucket);
  }
};

const uploadFile = async (file, documentType, actor) => {
  if (!file) {
    throw new AppError("No file uploaded", 400);
  }

  if (documentType && !allowedDocumentTypes.has(documentType)) {
    throw new AppError("Unsupported document type", 400);
  }

  const bucket = env.minio.bucket;
  const objectKey = buildObjectKey(file, documentType);
  const client = getMinioClient();

  await ensureBucket(client, bucket);
  await client.putObject(bucket, objectKey, file.buffer, file.size, {
    "Content-Type": file.mimetype,
    "X-Original-Name": file.originalname,
  });

  return uploadRepository.create({
    fileName: path.basename(objectKey),
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    bucket,
    objectKey,
    url: buildPublicUrl(bucket, objectKey),
    documentType: documentType || "file",
    uploadedBy: actor?.id,
  });
};

const getUploadById = async (id) => {
  const upload = await uploadRepository.findById(id);
  if (!upload) {
    throw new AppError("Upload not found", 404);
  }

  return upload;
};

module.exports = {
  uploadFile,
  getUploadById,
};
