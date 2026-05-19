let uploads = [];
let nextUploadId = 1;

const create = async (metadata) => {
  const upload = {
    id: nextUploadId,
    ...metadata,
    createdAt: new Date().toISOString(),
  };

  nextUploadId += 1;
  uploads = [upload, ...uploads];
  return upload;
};

const findById = async (id) => {
  return uploads.find((upload) => String(upload.id) === String(id)) || null;
};

const findByObjectKey = async (objectKey) => {
  return uploads.find((upload) => upload.objectKey === objectKey) || null;
};

module.exports = {
  create,
  findById,
  findByObjectKey,
};
