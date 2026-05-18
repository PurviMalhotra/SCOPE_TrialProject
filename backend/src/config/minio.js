const Minio = require("minio");
const env = require("./env");

let client;

const getMinioClient = () => {
  if (!client) {
    client = new Minio.Client({
      endPoint: env.minio.endPoint,
      port: env.minio.port,
      useSSL: env.minio.useSSL,
      accessKey: env.minio.accessKey,
      secretKey: env.minio.secretKey,
    });
  }

  return client;
};

module.exports = {
  getMinioClient,
};
