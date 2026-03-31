const httpStatus = require("http-status");
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const analyticsService = require("./analytics.service");

const getAdminOverview = asyncHandler(async (req, res) => {
  const data = await analyticsService.getAdminOverview();
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Admin analytics overview fetched", data));
});

const getClinicOverview = asyncHandler(async (req, res) => {
  const data = await analyticsService.getClinicOverview(req.user.id);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Clinic analytics overview fetched", data));
});

const getDoctorOverview = asyncHandler(async (req, res) => {
  const data = await analyticsService.getDoctorOverview(req.user.id);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Doctor analytics overview fetched", data));
});

module.exports = {
  getAdminOverview,
  getClinicOverview,
  getDoctorOverview
};
