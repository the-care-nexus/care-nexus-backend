const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");
const { requestLogMiddleware } = require("./middlewares/requestLog.middleware");

const app = express();

// Security & basics
app.use(helmet());
app.use(
  cors({
    origin: "*"
  })
);
app.use(morgan("dev"));
app.use(compression());
app.use(express.json());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use("/api", apiLimiter);

// Request logging to SystemLog (request type) for system module
app.use(requestLogMiddleware);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api/v1", routes);

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

