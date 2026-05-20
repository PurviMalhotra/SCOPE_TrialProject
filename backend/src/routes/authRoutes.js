const express = require("express");
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/config", authController.authConfig);
router.get("/google", authController.googleLogin);
router.get("/google/callback", authController.googleCallback);
router.post("/dev-login", authController.devLoginJson);
router.get("/me", requireAuth, authController.me);
router.post("/logout", requireAuth, authController.logout);

module.exports = router;
