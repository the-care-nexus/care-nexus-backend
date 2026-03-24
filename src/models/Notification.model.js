const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      required: true,
      trim: true
      // e.g. APPOINTMENT_BOOKED, APPOINTMENT_APPROVED, APPOINTMENT_REJECTED,
      // APPOINTMENT_CANCELLED, APPOINTMENT_RESCHEDULED, FOLLOW_UP_REMINDER,
      // APPOINTMENT_REMINDER, MISSED_APPOINTMENT
    },
    title: {
      type: String,
      trim: true
    },
    message: {
      type: String,
      trim: true
    },
    reference: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "referenceModel"
    },
    referenceModel: {
      type: String,
      enum: ["Appointment", "MedicalReport"],
      default: "Appointment"
    },
    read: {
      type: Boolean,
      default: false
    },
    meta: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
