const Bull = require("bull");
const QUEUES = require("../constants/queues");
const redisConfig = require("../config/redis");

let queue;

const getResumeQueue = () => {
  if (!queue) {
    queue = new Bull(QUEUES.RESUME_PARSE, redisConfig.url);
  }

  return queue;
};

module.exports = {
  getResumeQueue,
};
