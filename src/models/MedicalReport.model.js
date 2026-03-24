const mongoose = require("mongoose");

const medicalReportSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true
    },
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
    diagnosis: {
      type: String,
      trim: true
    },
    prescriptions: [
      {
        name: String,
        dosage: String,
        frequency: String,
        duration: String
      }
    ],
    notes: {
      type: String,
      trim: true
    },
    followUpDate: {
      type: Date,
      default: null
    },
    isLocked: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const MedicalReport = mongoose.model("MedicalReport", medicalReportSchema);

module.exports = MedicalReport;

