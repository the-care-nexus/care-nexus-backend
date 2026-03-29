const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const DoctorProfile = require("../../models/DoctorProfile.model");
const Appointment = require("../../models/Appointment.model");
const MedicalReport = require("../../models/MedicalReport.model");
const Payment = require("../../models/Payment.model");
const { APPOINTMENT_STATUS } = require("../../utils/constants");
const { createForAppointmentEvent } = require("../../services/notification.service");
const accessService = require("../../services/access.service");

const getMyProfile = async (userId) => {
  const profile = await DoctorProfile.findOne({ user: userId }).populate("clinic");
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Doctor profile not found");
  }
  return profile;
};

const upsertMyProfile = async (userId, payload) => {
  let profile = await DoctorProfile.findOne({ user: userId });
  if (!profile) {
    profile = await DoctorProfile.create({
      user: userId,
      ...payload
    });
  } else {
    Object.assign(profile, payload);
    await profile.save();
  }
  return profile;
};

const setAvailability = async (userId, availability) => {
  const profile = await DoctorProfile.findOne({ user: userId });
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Doctor profile not found");
  }
  profile.availability = availability;
  await profile.save();
  return profile;
};

const listMyAppointments = async (userId, status) => {
  const filter = { doctor: userId };
  if (status) {
    filter.status = status;
  }
  return Appointment.find(filter)
    .populate("patient", "name email")
    .populate("clinic", "name");
};

const updateAppointmentStatus = async (userId, appointmentId, status) => {
  if (!Object.values(APPOINTMENT_STATUS).includes(status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid appointment status");
  }

  const appt = await Appointment.findOne({ _id: appointmentId, doctor: userId });
  if (!appt) {
    throw new ApiError(httpStatus.NOT_FOUND, "Appointment not found");
  }

  appt.status = status;
  await appt.save();
  if (status === APPOINTMENT_STATUS.APPROVED || status === APPOINTMENT_STATUS.REJECTED) {
    createForAppointmentEvent(
      status === APPOINTMENT_STATUS.APPROVED ? "APPOINTMENT_APPROVED" : "APPOINTMENT_REJECTED",
      appt
    ).catch(() => {});
  }
  return appt;
};

const upsertMedicalReport = async (userId, appointmentId, payload) => {
  const appt = await Appointment.findOne({ _id: appointmentId, doctor: userId });
  if (!appt) {
    throw new ApiError(httpStatus.NOT_FOUND, "Appointment not found");
  }

  let report = await MedicalReport.findOne({ appointment: appointmentId });
  if (!report) {
    report = await MedicalReport.create({
      appointment: appointmentId,
      doctor: userId,
      patient: appt.patient,
      ...payload,
      isLocked: true
    });
  } else if (report.isLocked) {
    // Basic immutability: for MVP we allow doctor to overwrite once; you can later change logic
    Object.assign(report, payload);
    await report.save();
  }

  return report;
};

const getPatientHistory = async (userId, patientId) => {
  const allowed = await accessService.hasAccessToPatient(userId, patientId);
  if (!allowed) {
    throw new ApiError(httpStatus.FORBIDDEN, "You do not have access to this patient's data");
  }
  const appointments = await Appointment.find({
    doctor: userId,
    patient: patientId
  })
    .sort({ scheduledAt: -1 })
    .lean();
  const reports = await MedicalReport.find({
    doctor: userId,
    patient: patientId
  })
    .populate("appointment")
    .lean();
  return { appointments, reports };
};

const getAppointmentPayment = async (userId, appointmentId) => {
  const appt = await Appointment.findOne({ _id: appointmentId, doctor: userId });
  if (!appt) {
    throw new ApiError(httpStatus.NOT_FOUND, "Appointment not found");
  }
  const payment = await Payment.findOne({ appointment: appointmentId });
  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment record not found");
  }
  return payment;
};

module.exports = {
  getMyProfile,
  upsertMyProfile,
  setAvailability,
  listMyAppointments,
  updateAppointmentStatus,
  upsertMedicalReport,
  getPatientHistory,
  getAppointmentPayment
};

