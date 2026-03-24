const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      required: true
    },
    startTime: {
      type: String,
      required: true
      // Format "09:00"
    },
    endTime: {
      type: String,
      required: true
      // Format "17:00"
    }
  },
  { _id: false }
);

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic"
    },
    specialization: {
      type: String,
      trim: true
    },
    yearsOfExperience: {
      type: Number,
      default: 0
    },
    bio: {
      type: String,
      trim: true
    },
    consultationFee: {
      type: Number,
      default: 0
    },
    availability: [availabilitySchema]
  },
  { timestamps: true }
);

const DoctorProfile = mongoose.model("DoctorProfile", doctorProfileSchema);

module.exports = DoctorProfile;

