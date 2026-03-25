const SystemLog = require("../models/SystemLog.model");

/**
 * Log a request to SystemLog (type: request).
 * Used by request-logging middleware. Safe to call; swallows errors.
 */
const logRequest = async (method, path, statusCode, durationMs, meta = {}) => {
  try {
    await SystemLog.create({
      type: "request",
      method,
      path,
      statusCode,
      durationMs,
      meta: Object.keys(meta).length ? meta : undefined
    });
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[log.service] logRequest failed:", e.message);
    }
  }
};

/**
 * Log an error to SystemLog (type: error).
 * Integrates with central error handler. Safe to call; swallows errors.
 */
const logError = async (method, path, statusCode, message, stack = null, meta = {}) => {
  try {
    await SystemLog.create({
      type: "error",
      method: method || "N/A",
      path: path || "N/A",
      statusCode: statusCode || 500,
      message: message || "Unknown error",
      stack: stack || undefined,
      meta: Object.keys(meta).length ? meta : undefined
    });
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[log.service] logError failed:", e.message);
    }
  }
};

module.exports = {
  logRequest,
  logError
};
