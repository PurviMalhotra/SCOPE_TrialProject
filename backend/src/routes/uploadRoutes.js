const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const uploadController = require("../controllers/uploadController");

const router = express.Router();

router.post("/", upload.single("file"), uploadController.uploadFile);

module.exports = router;
