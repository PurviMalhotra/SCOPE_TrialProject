require("./loadEnv");

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5500),
  corsOrigin: process.env.CORS_ORIGIN || "*",
  jwtSecret: process.env.JWT_SECRET || "dev-only-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5170",
  enableDevAuth:
    process.env.ENABLE_DEV_AUTH === "true" ||
    (process.env.NODE_ENV || "development") === "development",
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      "http://localhost:5500/api/auth/google/callback",
  },
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 5432),
    name: process.env.DB_NAME || "scope_event_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "scope_dev_2026",
  },
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  minio: {
    endPoint: process.env.MINIO_ENDPOINT || "127.0.0.1",
    port: Number(process.env.MINIO_PORT || 9000),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
    bucket: process.env.MINIO_BUCKET || "scope-uploads",
    publicBaseUrl: process.env.MINIO_PUBLIC_BASE_URL || "",
  },
};

module.exports = env;
