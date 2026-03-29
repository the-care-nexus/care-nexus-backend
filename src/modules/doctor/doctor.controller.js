const httpStatus = require("http-status");
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const doctorService = require("./doctor.service");

const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await doctorService.getMyProfile(req.user.id);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Doctor profile fetched successfully", profile));
});

const upsertMyProfile = asyncHandler(async (req, res) => {
  const profile = await doctorService.upsertMyProfile(req.user.id, req.body);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Doctor profile saved successfully", profile));
});

const setAvailability = asyncHandler(async (req, res) => {
  const profile = await doctorService.setAvailability(req.user.id, req.body.availability || []);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Availability updated successfully", profile));
});

const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await doctorService.listMyAppointments(req.user.id, req.query.status);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Appointments fetched successfully", appointments));
});

const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const appt = await doctorService.updateAppointmentStatus(
    req.user.id,
    req.params.appointmentId,
    req.body.status
  );
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Appointment status updated successfully", appt));
});

const upsertMedicalReport = asyncHandler(async (req, res) => {
  const report = await doctorService.upsertMedicalReport(
    req.user.id,
    req.params.appointmentId,
    req.body
  );
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Medical report saved successfully", report));
});

const getPatientHistory = asyncHandler(async (req, res) => {
  const history = await doctorService.getPatientHistory(req.user.id, req.params.patientId);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Patient history fetched successfully", history));
});

const getAppointmentPayment = asyncHandler(async (req, res) => {
  const payment = await doctorService.getAppointmentPayment(req.user.id, req.params.appointmentId);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Payment fetched successfully", payment));
});

module.exports = {
  getMyProfile,
  upsertMyProfile,
  setAvailability,
  getMyAppointments,
  updateAppointmentStatus,
  upsertMedicalReport,
  getPatientHistory,
  getAppointmentPayment
};

