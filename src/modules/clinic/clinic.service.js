const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const Clinic = require("../../models/Clinic.model");
const User = require("../../models/User.model");
const { ROLES } = require("../../utils/constants");

const getMyClinic = async (userId) => {
  const clinic = await Clinic.findOne({ admin: userId }).populate("doctors", "name email role");
  if (!clinic) {
    throw new ApiError(httpStatus.NOT_FOUND, "Clinic not found for this admin");
  }
  return clinic;
};

const createOrUpdateClinic = async (userId, payload) => {
  let clinic = await Clinic.findOne({ admin: userId });
  if (!clinic) {
    clinic = await Clinic.create({
      ...payload,
      admin: userId
    });
  } else {
    Object.assign(clinic, payload);
    await clinic.save();
  }
  return clinic;
};

const addDoctorToClinic = async (adminId, doctorUserId) => {
  const clinic = await Clinic.findOne({ admin: adminId });
  if (!clinic) {
    throw new ApiError(httpStatus.NOT_FOUND, "Clinic not found");
  }

  const user = await User.findById(doctorUserId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "Doctor user not found");
  }

  if (user.role !== ROLES.DOCTOR) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User is not a doctor");
  }

  if (!clinic.doctors.find((id) => String(id) === String(user._id))) {
    clinic.doctors.push(user._id);
  }
  user.clinic = clinic._id;

  await user.save();
  await clinic.save();

  return clinic;
};

const removeDoctorFromClinic = async (adminId, doctorUserId) => {
  const clinic = await Clinic.findOne({ admin: adminId });
  if (!clinic) {
    throw new ApiError(httpStatus.NOT_FOUND, "Clinic not found");
  }

  clinic.doctors = clinic.doctors.filter((id) => String(id) !== String(doctorUserId));
  await clinic.save();

  const user = await User.findById(doctorUserId);
  if (user && String(user.clinic) === String(clinic._id)) {
    user.clinic = undefined;
    await user.save();
  }

  return clinic;
};

module.exports = {
  getMyClinic,
  createOrUpdateClinic,
  addDoctorToClinic,
  removeDoctorFromClinic
};

