const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const logService = require("../services/log.service");

// 404 handler
const notFoundHandler = (req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Resource not found"));
};

// Central error handler. Logs errors to SystemLog (type: error) for system module listing.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message =
    err.message || httpStatus[httpStatus.INTERNAL_SERVER_ERROR] || "Internal Server Error";

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  const method = req && req.method;
  const path = (req && (req.originalUrl || req.path)) || "";
  logService
    .logError(method, path, statusCode, message, err.stack, { errors: err.errors })
    .catch(() => {});

  return res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};

