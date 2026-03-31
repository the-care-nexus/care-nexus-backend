const Appointment = require("../../models/Appointment.model");
const Clinic = require("../../models/Clinic.model");
const User = require("../../models/User.model");
const { APPOINTMENT_STATUS } = require("../../utils/constants");
const { ROLES } = require("../../utils/constants");

/**
 * Admin overview: appointment counts by status, clinic stats, doctor stats, patient visit counts.
 */
const getAdminOverview = async () => {
  const byStatus = await Appointment.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  const statusCounts = Object.fromEntries(
    Object.values(APPOINTMENT_STATUS).map((s) => [s, 0])
  );
  byStatus.forEach(({ _id, count }) => {
    statusCounts[_id] = count;
  });

  const clinicStats = await Appointment.aggregate([
    { $group: { _id: "$clinic", total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ["$status", APPOINTMENT_STATUS.COMPLETED] }, 1, 0] } } } },
    { $lookup: { from: "clinics", localField: "_id", foreignField: "_id", as: "c" } },
    { $unwind: "$c" },
    { $project: { clinicId: "$_id", clinicName: "$c.name", total: 1, completed: 1 } }
  ]);

  const doctorStats = await Appointment.aggregate([
    { $group: { _id: "$doctor", total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ["$status", APPOINTMENT_STATUS.COMPLETED] }, 1, 0] } } } },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "u" } },
    { $unwind: "$u" },
    { $project: { doctorId: "$_id", doctorName: "$u.name", total: 1, completed: 1 } }
  ]);

  const patientVisits = await Appointment.aggregate([
    { $group: { _id: "$patient", visitCount: { $sum: 1 } } },
    { $sort: { visitCount: -1 } },
    { $limit: 100 },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "u" } },
    { $unwind: "$u" },
    { $project: { patientId: "$_id", patientName: "$u.name", visitCount: 1 } }
  ]);

  const totalClinics = await Clinic.countDocuments();
  const totalDoctors = await User.countDocuments({ role: ROLES.DOCTOR });
  const totalPatients = await User.countDocuments({ role: ROLES.PATIENT });

  return {
    appointmentsByStatus: statusCounts,
    clinicStats,
    doctorStats,
    patientVisits,
    totals: { clinics: totalClinics, doctors: totalDoctors, patients: totalPatients }
  };
};

/**
 * Clinic overview: stats for the current clinic admin's clinic.
 */
const getClinicOverview = async (adminUserId) => {
  const clinic = await Clinic.findOne({ admin: adminUserId }).select("_id name").lean();
  if (!clinic) {
    return { clinic: null, appointmentsByStatus: {}, doctorStats: [], totalAppointments: 0 };
  }

  const byStatus = await Appointment.aggregate([
    { $match: { clinic: clinic._id } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  const statusCounts = Object.fromEntries(
    Object.values(APPOINTMENT_STATUS).map((s) => [s, 0])
  );
  byStatus.forEach(({ _id, count }) => {
    statusCounts[_id] = count;
  });

  const doctorStats = await Appointment.aggregate([
    { $match: { clinic: clinic._id } },
    { $group: { _id: "$doctor", total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ["$status", APPOINTMENT_STATUS.COMPLETED] }, 1, 0] } } } },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "u" } },
    { $unwind: "$u" },
    { $project: { doctorId: "$_id", doctorName: "$u.name", total: 1, completed: 1 } }
  ]);

  const totalAppointments = await Appointment.countDocuments({ clinic: clinic._id });

  return {
    clinic: { _id: clinic._id, name: clinic.name },
    appointmentsByStatus: statusCounts,
    doctorStats,
    totalAppointments
  };
};

/**
 * Doctor overview: stats for the current doctor.
 */
const getDoctorOverview = async (doctorUserId) => {
  const byStatus = await Appointment.aggregate([
    { $match: { doctor: doctorUserId } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  const statusCounts = Object.fromEntries(
    Object.values(APPOINTMENT_STATUS).map((s) => [s, 0])
  );
  byStatus.forEach(({ _id, count }) => {
    statusCounts[_id] = count;
  });

  const totalAppointments = await Appointment.countDocuments({ doctor: doctorUserId });
  const completedCount = statusCounts[APPOINTMENT_STATUS.COMPLETED] || 0;

  return {
    appointmentsByStatus: statusCounts,
    totalAppointments,
    completedAppointments: completedCount
  };
};

module.exports = {
  getAdminOverview,
  getClinicOverview,
  getDoctorOverview
};
