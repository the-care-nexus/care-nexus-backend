const Notification = require("../models/Notification.model");
const { APPOINTMENT_STATUS } = require("../utils/constants");

const MESSAGES = {
  APPOINTMENT_BOOKED: {
    title: "New appointment",
    message: "A new appointment has been booked with you."
  },
  APPOINTMENT_APPROVED: {
    title: "Appointment approved",
    message: "Your appointment has been approved."
  },
  APPOINTMENT_REJECTED: {
    title: "Appointment rejected",
    message: "Your appointment request was rejected."
  },
  APPOINTMENT_CANCELLED: {
    title: "Appointment cancelled",
    message: "An appointment was cancelled."
  },
  APPOINTMENT_RESCHEDULED: {
    title: "Appointment rescheduled",
    message: "An appointment was rescheduled."
  },
  FOLLOW_UP_REMINDER: {
    title: "Follow-up reminder",
    message: "You have a follow-up visit due."
  },
  APPOINTMENT_REMINDER: {
    title: "Appointment reminder",
    message: "You have an upcoming appointment."
  },
  MISSED_APPOINTMENT: {
    title: "Missed appointment",
    message: "An appointment was missed."
  }
};

/**
 * Create a notification for a user. Safe to call; swallows errors.
 */
const create = async (userId, type, { title, message, reference, referenceModel = "Appointment", meta } = {}) => {
  try {
    const t = MESSAGES[type] || {};
    await Notification.create({
      user: userId,
      type,
      title: title || t.title || type,
      message: message || t.message || "",
      reference: reference || undefined,
      referenceModel,
      meta: meta || undefined
    });
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[notification.service] create failed:", e.message);
    }
  }
};

/**
 * Create notifications for appointment events.
 * book -> notify doctor; approve/reject -> notify patient; cancel/reschedule -> notify doctor.
 */
const createForAppointmentEvent = async (event, appointment) => {
  const ref = appointment._id;
  const meta = { appointmentId: String(ref), patient: String(appointment.patient), doctor: String(appointment.doctor) };
  if (event === "APPOINTMENT_BOOKED") {
    await create(appointment.doctor, "APPOINTMENT_BOOKED", { reference: ref, meta });
    return;
  }
  if (event === "APPOINTMENT_APPROVED" || event === "APPOINTMENT_REJECTED") {
    await create(appointment.patient, event, { reference: ref, meta });
    return;
  }
  if (event === "APPOINTMENT_CANCELLED" || event === "APPOINTMENT_RESCHEDULED") {
    await create(appointment.doctor, event, { reference: ref, meta });
    return;
  }
};

const listByUser = async (userId, options = {}) => {
  const { limit = 50, skip = 0, unreadOnly } = options;
  const filter = { user: userId };
  if (unreadOnly) filter.read = false;
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Math.min(limit, 100))
    .lean();
  const total = await Notification.countDocuments(filter);
  return { notifications, total, limit, skip };
};

const markAsRead = async (userId, notificationId) => {
  const n = await Notification.findOne({ _id: notificationId, user: userId });
  if (!n) return null;
  n.read = true;
  await n.save();
  return n;
};

module.exports = {
  create,
  createForAppointmentEvent,
  listByUser,
  markAsRead,
  MESSAGES
};
