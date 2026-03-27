const express = require("express");
const { authenticate, authorizeRoles } = require("../../middlewares/auth.middleware");
const { ROLES } = require("../../utils/constants");
const adminController = require("./admin.controller");

const router = express.Router();

router.use(authenticate, authorizeRoles(ROLES.SUPER_ADMIN));

router.get("/clinics", adminController.getClinics);
router.patch("/clinics/:id/status", adminController.updateClinicStatus);

router.get("/users", adminController.getUsers);
router.patch("/users/:id/status", adminController.updateUserStatus);

module.exports = router;

