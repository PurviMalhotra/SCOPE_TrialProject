const app = require("./app");
const env = require("./config/env");
const logger = require("./utils/logger");
const { connectDb } = require("../database/db");

const start = async () => {
  try {
    await connectDb();
  } catch (err) {
    logger.error(`Database connection failed: ${err.message}`);
    process.exit(1);
  }

  app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`);
    logger.info(`Google OAuth callback → ${env.google.callbackUrl}`);
    logger.info(`Add this EXACT URI in Google Cloud Console → Credentials → OAuth client → Authorized redirect URIs`);
  });
};

start();
