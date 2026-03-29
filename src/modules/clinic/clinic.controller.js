const httpStatus = require("http-status");
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const clinicService = require("./clinic.service");

const getMyClinic = asyncHandler(async (req, res) => {
  const clinic = await clinicService.getMyClinic(req.user.id);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Clinic fetched successfully", clinic));
});

const upsertMyClinic = asyncHandler(async (req, res) => {
  const clinic = await clinicService.createOrUpdateClinic(req.user.id, req.body);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Clinic saved successfully", clinic));
});

const addDoctor = asyncHandler(async (req, res) => {
  const clinic = await clinicService.addDoctorToClinic(req.user.id, req.body.doctorUserId);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Doctor added to clinic successfully", clinic));
});

const removeDoctor = asyncHandler(async (req, res) => {
  const clinic = await clinicService.removeDoctorFromClinic(req.user.id, req.params.doctorUserId);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Doctor removed from clinic successfully", clinic));
});

module.exports = {
  getMyClinic,
  upsertMyClinic,
  addDoctor,
  removeDoctor
};

