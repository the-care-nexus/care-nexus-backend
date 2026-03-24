const mongoose = require("mongoose");

const patientProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"]
    },
    bloodGroup: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    }
  },
  { timestamps: true }
);

const PatientProfile = mongoose.model("PatientProfile", patientProfileSchema);

module.exports = PatientProfile;

