const mongoose = require("mongoose");

/**
 * Explicit patient consent for doctor access.
 * Doctor can access patient data if:
 * - An appointment exists between them (implicit), OR
 * - Patient has granted access via this model (explicit).
 */
const patientAccessSchema = new mongoose.Schema(
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
    grantedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

patientAccessSchema.index({ patient: 1, doctor: 1 }, { unique: true });

const PatientAccess = mongoose.model("PatientAccess", patientAccessSchema);

module.exports = PatientAccess;
