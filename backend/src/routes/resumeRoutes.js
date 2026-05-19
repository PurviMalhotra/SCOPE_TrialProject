const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const {
  parseResume,
  createParseJob,
  getParseJob,
} = require("../controllers/resumeController");

const router = express.Router();

router.post("/parse", upload.single("resume"), parseResume);
router.post("/jobs", createParseJob);
router.get("/jobs/:jobId", getParseJob);

module.exports = router;
