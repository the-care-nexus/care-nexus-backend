const mongoose = require("mongoose");
const { APPOINTMENT_STATUS } = require("../utils/constants");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true
    },
    scheduledAt: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.PENDING
    },
    reason: {
      type: String,
      trim: true
    },
    fee: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;

