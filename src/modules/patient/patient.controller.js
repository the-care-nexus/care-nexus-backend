const httpStatus = require("http-status");
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const patientService = require("./patient.service");

const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await patientService.getMyProfile(req.user.id);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Patient profile fetched successfully", profile));
});

const upsertMyProfile = asyncHandler(async (req, res) => {
  const profile = await patientService.upsertMyProfile(req.user.id, req.body);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Patient profile saved successfully", profile));
});

const bookAppointment = asyncHandler(async (req, res) => {
  const appt = await patientService.bookAppointment(req.user.id, req.body);
  return res
    .status(httpStatus.CREATED)
    .json(new ApiResponse(true, "Appointment booked successfully", appt));
});

const listMyAppointments = asyncHandler(async (req, res) => {
  const appts = await patientService.listMyAppointments(req.user.id);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Appointments fetched successfully", appts));
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const appt = await patientService.cancelAppointment(req.user.id, req.params.appointmentId);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Appointment cancelled successfully", appt));
});

const rescheduleAppointment = asyncHandler(async (req, res) => {
  const appt = await patientService.rescheduleAppointment(
    req.user.id,
    req.params.appointmentId,
    req.body.scheduledAt
  );
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Appointment rescheduled successfully", appt));
});

const listMyReports = asyncHandler(async (req, res) => {
  const reports = await patientService.listMyReports(req.user.id);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Reports fetched successfully", reports));
});

const getReportByAppointment = asyncHandler(async (req, res) => {
  const report = await patientService.getReportByAppointment(req.user.id, req.params.appointmentId);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Report fetched successfully", report));
});

const listMyPayments = asyncHandler(async (req, res) => {
  const payments = await patientService.listMyPayments(req.user.id);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Payments fetched successfully", payments));
});

const grantAccess = asyncHandler(async (req, res) => {
  const { doctorId } = req.body;
  const grant = await patientService.grantAccess(req.user.id, doctorId);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Access granted to doctor", grant));
});

const revokeAccess = asyncHandler(async (req, res) => {
  const doctorId = req.body.doctorId || req.query.doctorId;
  await patientService.revokeAccess(req.user.id, doctorId);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Access revoked from doctor", null));
});

const getPatientHistory = asyncHandler(async (req, res) => {
  const history = await patientService.getPatientHistoryCentral(
    req.params.id,
    req.user.id,
    req.user.role
  );
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Patient history fetched successfully", history));
});

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
  getPatientHistory
};

