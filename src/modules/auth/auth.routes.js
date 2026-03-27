const express = require("express");
const { authenticate } = require("../../middlewares/auth.middleware");
const authController = require("./auth.controller");

const router = express.Router();

// Public
router.post("/register", authController.registerPatient);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshTokens);
router.post("/logout", authController.logout);

// Protected
router.get("/me", authenticate, authController.getMe);

module.exports = router;

