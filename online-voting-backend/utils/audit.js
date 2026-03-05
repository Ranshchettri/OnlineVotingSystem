const AuditLog = require("../models/AuditLog");

const getIpAddress = (req) =>
  req?.headers?.["x-forwarded-for"] ||
  req?.connection?.remoteAddress ||
  req?.socket?.remoteAddress ||
  req?.ip ||
  "unknown";

const writeAuditLog = async ({
  action,
  userId,
  userRole,
  req,
  metadata = {},
}) => {
  if (!action) return;
  try {
    await AuditLog.create({
      action,
      userId,
      userRole,
      ipAddress: getIpAddress(req),
      userAgent: req?.headers?.["user-agent"] || "unknown",
      metadata,
    });
  } catch (error) {
    console.error("Failed to write audit log:", error.message);
  }
};

module.exports = { writeAuditLog };
