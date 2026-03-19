const logService = require("../services/log.service");

/**
 * Request logging middleware.
 * Records method, path, statusCode, durationMs and writes to SystemLog (type: request).
 * Skips /health to reduce noise.
 */
const requestLogMiddleware = (req, res, next) => {
  if (req.path === "/health") return next();

  const start = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    logService
      .logRequest(req.method, req.originalUrl || req.path, res.statusCode, durationMs)
      .catch(() => {});
  });
  next();
};

module.exports = { requestLogMiddleware };
