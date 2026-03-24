const mongoose = require("mongoose");

const systemLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["request", "error"],
      required: true
    },
    method: { type: String, trim: true },
    path: { type: String, trim: true },
    statusCode: { type: Number },
    message: { type: String, trim: true },
    stack: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed },
    durationMs: { type: Number }
  },
  { timestamps: true }
);

systemLogSchema.index({ type: 1, createdAt: -1 });
systemLogSchema.index({ createdAt: -1 });

const SystemLog = mongoose.model("SystemLog", systemLogSchema);

module.exports = SystemLog;
