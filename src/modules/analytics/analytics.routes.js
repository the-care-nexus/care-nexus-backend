const express = require("express");
const { authenticate, authorizeRoles } = require("../../middlewares/auth.middleware");
const { ROLES } = require("../../utils/constants");
const analyticsController = require("./analytics.controller");

const router = express.Router();

router.get(
  "/admin/overview",
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN),
  analyticsController.getAdminOverview
);
router.get(
  "/clinic/overview",
  authenticate,
  authorizeRoles(ROLES.CLINIC_ADMIN),
  analyticsController.getClinicOverview
);
router.get(
  "/doctor/overview",
  authenticate,
  authorizeRoles(ROLES.DOCTOR),
  analyticsController.getDoctorOverview
);

module.exports = router;
