const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userRole: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    location: {
      latitude: Number,
      longitude: Number,
      city: String,
      country: String,
    },
    metadata: { type: Object },
  },
  { timestamps: { createdAt: "timestamp", updatedAt: false } },
);

auditLogSchema.index({ userId: 1, action: 1 });
auditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
