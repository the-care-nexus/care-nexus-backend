const httpStatus = require("http-status");
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const adminService = require("./admin.service");

const getClinics = asyncHandler(async (req, res) => {
  const clinics = await adminService.listClinics();
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Clinics fetched successfully", clinics));
});

const updateClinicStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const clinic = await adminService.updateClinicStatus(req.params.id, status);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Clinic status updated successfully", clinic));
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await adminService.listUsers();
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Users fetched successfully", users));
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const user = await adminService.updateUserStatus(req.params.id, status);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "User status updated successfully", user));
});

module.exports = {
  getClinics,
  updateClinicStatus,
  getUsers,
  updateUserStatus
};

