const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const Clinic = require("../../models/Clinic.model");
const User = require("../../models/User.model");
const { CLINIC_STATUS, USER_STATUS } = require("../../utils/constants");

const listClinics = async () => {
  return Clinic.find().populate("admin", "name email role");
};

const updateClinicStatus = async (clinicId, status) => {
  if (!Object.values(CLINIC_STATUS).includes(status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid clinic status");
  }
  const clinic = await Clinic.findByIdAndUpdate(
    clinicId,
    { status },
    { new: true }
  ).populate("admin", "name email role");
  if (!clinic) {
    throw new ApiError(httpStatus.NOT_FOUND, "Clinic not found");
  }
  return clinic;
};

const listUsers = async () => {
  return User.find().select("name email role status clinic");
};

const updateUserStatus = async (userId, status) => {
  if (!Object.values(USER_STATUS).includes(status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user status");
  }
  const user = await User.findByIdAndUpdate(
    userId,
    { status },
    { new: true }
  ).select("name email role status clinic");
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

module.exports = {
  listClinics,
  updateClinicStatus,
  listUsers,
  updateUserStatus
};

