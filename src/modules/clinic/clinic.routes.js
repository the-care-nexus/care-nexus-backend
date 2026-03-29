const express = require("express");
const { authenticate, authorizeRoles } = require("../../middlewares/auth.middleware");
const { ROLES } = require("../../utils/constants");
const clinicController = require("./clinic.controller");

const router = express.Router();

router.use(authenticate, authorizeRoles(ROLES.CLINIC_ADMIN));

router.get("/me", clinicController.getMyClinic);
router.put("/me", clinicController.upsertMyClinic);
router.post("/doctors", clinicController.addDoctor);
router.delete("/doctors/:doctorUserId", clinicController.removeDoctor);

module.exports = router;

