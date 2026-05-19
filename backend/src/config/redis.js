const env = require("./env");

const redisConfig = {
  url: env.redisUrl,
};

module.exports = redisConfig;
