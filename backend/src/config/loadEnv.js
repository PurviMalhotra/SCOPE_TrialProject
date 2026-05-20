const path = require("path");
const dotenv = require("dotenv");

// Always load backend/.env regardless of current working directory
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

module.exports = {};
