const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/google", authController.googleLogin);
router.get("/google/callback", authController.googleCallback);
router.get("/me", authController.me);
router.post("/logout", authController.logout);

module.exports = router;
