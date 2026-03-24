const mongoose = require("mongoose");
const { CLINIC_STATUS } = require("../utils/constants");

const clinicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    status: {
      type: String,
      enum: Object.values(CLINIC_STATUS),
      default: CLINIC_STATUS.PENDING
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    doctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

const Clinic = mongoose.model("Clinic", clinicSchema);

module.exports = Clinic;

