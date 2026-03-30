const express = require("express");
const { authenticate, authorizeRoles } = require("../../middlewares/auth.middleware");
const { ROLES } = require("../../utils/constants");
const patientController = require("./patient.controller");

const router = express.Router();

router.use(authenticate);

// Patient-only (define /me before /:id/history so /me is not matched as id)
router.get("/me", authorizeRoles(ROLES.PATIENT), patientController.getMyProfile);
router.put("/me", authorizeRoles(ROLES.PATIENT), patientController.upsertMyProfile);

// Clinician-only: centralized patient history (permission-based)
router.get(
  "/:id/history",
  authorizeRoles(ROLES.DOCTOR, ROLES.CLINIC_ADMIN),
  patientController.getPatientHistory
);

// Patient-only routes (rest)
router.use(authorizeRoles(ROLES.PATIENT));

router.post("/appointments", patientController.bookAppointment);
router.get("/appointments", patientController.listMyAppointments);
router.patch("/appointments/:appointmentId/cancel", patientController.cancelAppointment);
router.patch(
  "/appointments/:appointmentId/reschedule",
  patientController.rescheduleAppointment
);

router.get("/reports", patientController.listMyReports);
router.get("/reports/appointment/:appointmentId", patientController.getReportByAppointment);

router.get("/payments", patientController.listMyPayments);

router.post("/access/grant", patientController.grantAccess);
router.delete("/access/revoke", patientController.revokeAccess);

module.exports = router;

