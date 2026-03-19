const express = require('express');
const {
  notFoundHandler,
  errorHandler,
} = require('./middlewares/error.middleware');
const { requestLogMiddleware } = require('./middlewares/requestLog.middleware');

const app = express();

// Request logging to SystemLog (request type) for system module
app.use(requestLogMiddleware);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
