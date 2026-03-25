const Appointment = require("../models/Appointment.model");
const PatientAccess = require("../models/PatientAccess.model");
const Clinic = require("../models/Clinic.model");

/**
 * Doctor has access to patient if:
 * - An appointment exists between them (implicit), OR
 * - Patient has granted access via PatientAccess (explicit).
 * Does not remove existing implicit access.
 */
const hasAccessToPatient = async (doctorId, patientId) => {
  const [hasAppointment, hasConsent] = await Promise.all([
    Appointment.exists({ doctor: doctorId, patient: patientId }),
    PatientAccess.exists({ doctor: doctorId, patient: patientId })
  ]);
  return !!(hasAppointment || hasConsent);
};

/**
 * Clinic admin has access to patient if patient has at least one appointment
 * at a clinic where the given user is the admin.
 */
const hasClinicAdminAccessToPatient = async (adminUserId, patientId) => {
  const clinic = await Clinic.findOne({ admin: adminUserId }).select("_id").lean();
  if (!clinic) return false;
  const hasAppointment = await Appointment.exists({
    clinic: clinic._id,
    patient: patientId
  });
  return !!hasAppointment;
};

const grant = async (patientId, doctorId) => {
  const existing = await PatientAccess.findOne({ patient: patientId, doctor: doctorId });
  if (existing) return existing;
  return PatientAccess.create({ patient: patientId, doctor: doctorId });
};

const revoke = async (patientId, doctorId) => {
  const doc = await PatientAccess.findOneAndDelete({ patient: patientId, doctor: doctorId });
  return doc;
};

module.exports = {
  hasAccessToPatient,
  hasClinicAdminAccessToPatient,
  grant,
  revoke
};
