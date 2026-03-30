const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const PatientProfile = require("../../models/PatientProfile.model");
const Appointment = require("../../models/Appointment.model");
const MedicalReport = require("../../models/MedicalReport.model");
const Payment = require("../../models/Payment.model");
const User = require("../../models/User.model");
const { APPOINTMENT_STATUS, PAYMENT_STATUS, ROLES } = require("../../utils/constants");
const { createForAppointmentEvent } = require("../../services/notification.service");
const accessService = require("../../services/access.service");

const getMyProfile = async (userId) => {
  const profile = await PatientProfile.findOne({ user: userId });
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Patient profile not found");
  }
  return profile;
};

const upsertMyProfile = async (userId, payload) => {
  let profile = await PatientProfile.findOne({ user: userId });
  if (!profile) {
    profile = await PatientProfile.create({
      user: userId,
      ...payload
    });
  } else {
    Object.assign(profile, payload);
    await profile.save();
  }
  return profile;
};

const bookAppointment = async (userId, payload) => {
  const appt = await Appointment.create({
    patient: userId,
    doctor: payload.doctorId,
    clinic: payload.clinicId,
    scheduledAt: payload.scheduledAt,
    reason: payload.reason,
    fee: payload.fee || 0
  });

  await Payment.create({
    appointment: appt._id,
    patient: userId,
    amount: appt.fee,
    status: PAYMENT_STATUS.UNPAID
  });

  createForAppointmentEvent("APPOINTMENT_BOOKED", appt).catch(() => {});

  return appt;
};

const listMyAppointments = async (userId) => {
  return Appointment.find({ patient: userId })
    .populate("doctor", "name email")
    .populate("clinic", "name");
};

const cancelAppointment = async (userId, appointmentId) => {
  const appt = await Appointment.findOne({ _id: appointmentId, patient: userId });
  if (!appt) {
    throw new ApiError(httpStatus.NOT_FOUND, "Appointment not found");
  }
  if (![APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.APPROVED].includes(appt.status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cannot cancel this appointment");
  }
  appt.status = APPOINTMENT_STATUS.CANCELLED;
  await appt.save();
  createForAppointmentEvent("APPOINTMENT_CANCELLED", appt).catch(() => {});
  return appt;
};

const rescheduleAppointment = async (userId, appointmentId, scheduledAt) => {
  const appt = await Appointment.findOne({ _id: appointmentId, patient: userId });
  if (!appt) {
    throw new ApiError(httpStatus.NOT_FOUND, "Appointment not found");
  }
  if (appt.status !== APPOINTMENT_STATUS.PENDING) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Only pending appointments can be rescheduled");
  }
  appt.scheduledAt = scheduledAt;
  await appt.save();
  createForAppointmentEvent("APPOINTMENT_RESCHEDULED", appt).catch(() => {});
  return appt;
};

const listMyReports = async (userId) => {
  return MedicalReport.find({ patient: userId })
    .populate("doctor", "name email")
    .populate("appointment");
};

const getReportByAppointment = async (userId, appointmentId) => {
  const report = await MedicalReport.findOne({ patient: userId, appointment: appointmentId })
    .populate("doctor", "name email")
    .populate("appointment");
  if (!report) {
    throw new ApiError(httpStatus.NOT_FOUND, "Report not found");
  }
  return report;
};

const listMyPayments = async (userId) => {
  return Payment.find({ patient: userId }).populate("appointment");
};

const grantAccess = async (patientId, doctorId) => {
  if (!doctorId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "doctorId is required");
  }
  const doctor = await User.findById(doctorId).select("role");
  if (!doctor || doctor.role !== ROLES.DOCTOR) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid doctor");
  }
  return accessService.grant(patientId, doctorId);
};

const revokeAccess = async (patientId, doctorId) => {
  if (!doctorId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "doctorId is required");
  }
  const doc = await accessService.revoke(patientId, doctorId);
  if (!doc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Access grant not found");
  }
  return doc;
};

/**
 * Centralized patient timeline (appointments + reports), permission-aware.
 * DOCTOR: access via appointment or explicit consent. CLINIC_ADMIN: access if patient has appointment at admin's clinic.
 */
const getPatientHistoryCentral = async (patientId, requestorUserId, requestorRole) => {
  let allowed = false;
  if (requestorRole === ROLES.DOCTOR) {
    allowed = await accessService.hasAccessToPatient(requestorUserId, patientId);
  } else if (requestorRole === ROLES.CLINIC_ADMIN) {
    allowed = await accessService.hasClinicAdminAccessToPatient(requestorUserId, patientId);
  }
  if (!allowed) {
    throw new ApiError(httpStatus.FORBIDDEN, "You do not have access to this patient's history");
  }
  const [appointments, reports] = await Promise.all([
    Appointment.find({ patient: patientId })
      .populate("doctor", "name email")
      .populate("clinic", "name")
      .sort({ scheduledAt: -1 })
      .lean(),
    MedicalReport.find({ patient: patientId })
      .populate("doctor", "name email")
      .populate("appointment")
      .sort({ createdAt: -1 })
      .lean()
  ]);
  const timeline = [];
  for (const a of appointments) {
    timeline.push({
      type: "appointment",
      date: a.scheduledAt,
      ...a
    });
  }
  for (const r of reports) {
    timeline.push({
      type: "report",
      date: r.createdAt,
      ...r
    });
  }
  timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
  return { patientId, timeline, appointments, reports };
};

module.exports = {
  getMyProfile,
  upsertMyProfile,
  bookAppointment,
  listMyAppointments,
  cancelAppointment,
  rescheduleAppointment,
  listMyReports,
  getReportByAppointment,
  listMyPayments,
  grantAccess,
  revokeAccess,
  getPatientHistoryCentral
};

