const cron = require("node-cron");
const mongoose = require("mongoose");
const MedicalReport = require("../models/MedicalReport.model");
const Appointment = require("../models/Appointment.model");
const Notification = require("../models/Notification.model");
const { create } = require("./notification.service");
const { APPOINTMENT_STATUS } = require("../utils/constants");

const startOfTodayUtc = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * Check if we already sent a notification of this type for this reference today (idempotent).
 */
const alreadySentToday = async (type, referenceId) => {
  const start = startOfTodayUtc();
  const exists = await Notification.findOne({
    type,
    reference: referenceId,
    createdAt: { $gte: start }
  });
  return !!exists;
};

/**
 * Follow-up reminders: reports with followUpDate today or tomorrow. Notify patient.
 */
const runFollowUpReminders = async () => {
  try {
    const now = new Date();
    const tomorrowEnd = new Date(now);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 2);
    tomorrowEnd.setUTCHours(0, 0, 0, 0);
    const reports = await MedicalReport.find({
      followUpDate: { $gte: startOfTodayUtc(), $lt: tomorrowEnd, $ne: null }
    })
      .select("patient appointment followUpDate")
      .lean();
    for (const r of reports) {
      if (!r.followUpDate) continue;
      if (await alreadySentToday("FOLLOW_UP_REMINDER", r.appointment)) continue;
      await create(r.patient, "FOLLOW_UP_REMINDER", {
        reference: r.appointment,
        referenceModel: "MedicalReport",
        meta: { reportId: String(r._id), followUpDate: r.followUpDate }
      });
    }
  } catch (e) {
    console.error("[cron] followUpReminders error:", e.message);
  }
};

/**
 * Appointment reminders: upcoming appointments within ~24h. Notify patient and doctor.
 */
const runAppointmentReminders = async () => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const appts = await Appointment.find({
      scheduledAt: { $gte: now, $lte: in24h },
      status: { $in: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.APPROVED] }
    })
      .select("patient doctor scheduledAt")
      .lean();
    for (const a of appts) {
      if (await alreadySentToday("APPOINTMENT_REMINDER", a._id)) continue;
      await create(a.patient, "APPOINTMENT_REMINDER", {
        reference: a._id,
        meta: { appointmentId: String(a._id), scheduledAt: a.scheduledAt }
      });
      await create(a.doctor, "APPOINTMENT_REMINDER", {
        reference: a._id,
        meta: { appointmentId: String(a._id), scheduledAt: a.scheduledAt }
      });
    }
  } catch (e) {
    console.error("[cron] appointmentReminders error:", e.message);
  }
};

/**
 * Missed appointment alerts: scheduledAt in the past, status PENDING or APPROVED.
 */
const runMissedAppointmentAlerts = async () => {
  try {
    const now = new Date();
    const appts = await Appointment.find({
      scheduledAt: { $lt: now },
      status: { $in: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.APPROVED] }
    })
      .select("patient doctor scheduledAt")
      .lean();
    for (const a of appts) {
      if (await alreadySentToday("MISSED_APPOINTMENT", a._id)) continue;
      await create(a.patient, "MISSED_APPOINTMENT", {
        reference: a._id,
        meta: { appointmentId: String(a._id), scheduledAt: a.scheduledAt }
      });
      await create(a.doctor, "MISSED_APPOINTMENT", {
        reference: a._id,
        meta: { appointmentId: String(a._id), scheduledAt: a.scheduledAt }
      });
    }
  } catch (e) {
    console.error("[cron] missedAppointmentAlerts error:", e.message);
  }
};

/**
 * Run all cron jobs once (for manual/testing).
 */
const runAllJobs = async () => {
  await runFollowUpReminders();
  await runAppointmentReminders();
  await runMissedAppointmentAlerts();
};

/**
 * Schedule cron jobs. Safe to call after DB connect.
 */
const scheduleJobs = () => {
  // Every hour
  cron.schedule("0 * * * *", () => {
    if (mongoose.connection.readyState !== 1) return;
    runFollowUpReminders().catch(() => {});
    runAppointmentReminders().catch(() => {});
    runMissedAppointmentAlerts().catch(() => {});
  });
  console.log("[cron] Scheduled jobs (hourly): follow-up reminders, appointment reminders, missed alerts.");
};

module.exports = {
  runFollowUpReminders,
  runAppointmentReminders,
  runMissedAppointmentAlerts,
  runAllJobs,
  scheduleJobs
};
