const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { parseResume } = require("../controllers/resumeController");

const router = express.Router();

router.post("/parse", upload.single("resume"), parseResume);

module.exports = router;
