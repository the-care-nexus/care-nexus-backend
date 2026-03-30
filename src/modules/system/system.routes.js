const express = require("express");
const { authenticate, authorizeRoles } = require("../../middlewares/auth.middleware");
const { ROLES } = require("../../utils/constants");
const systemController = require("./system.controller");

const router = express.Router();

// Admin-only (SUPER_ADMIN)
router.use(authenticate, authorizeRoles(ROLES.SUPER_ADMIN));

router.get("/health", systemController.getHealth);
router.get("/logs", systemController.getLogs);
router.get("/errors", systemController.getErrors);
router.get("/backup/status", systemController.getBackupStatus);
router.post("/backup/run", systemController.runBackup);

module.exports = router;
