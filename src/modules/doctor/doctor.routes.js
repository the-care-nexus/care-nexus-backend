const express = require("express");
const { authenticate, authorizeRoles } = require("../../middlewares/auth.middleware");
const { ROLES } = require("../../utils/constants");
const doctorController = require("./doctor.controller");

const router = express.Router();

router.use(authenticate, authorizeRoles(ROLES.DOCTOR));

router.get("/me", doctorController.getMyProfile);
router.put("/me", doctorController.upsertMyProfile);
router.put("/availability", doctorController.setAvailability);
router.get("/appointments", doctorController.getMyAppointments);
router.patch("/appointments/:appointmentId/status", doctorController.updateAppointmentStatus);
router.put("/appointments/:appointmentId/report", doctorController.upsertMedicalReport);
router.get("/patients/:patientId/history", doctorController.getPatientHistory);
router.get("/appointments/:appointmentId/payment", doctorController.getAppointmentPayment);

module.exports = router;

