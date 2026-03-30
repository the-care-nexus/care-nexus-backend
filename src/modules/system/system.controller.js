const httpStatus = require("http-status");
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const systemService = require("./system.service");

const getHealth = asyncHandler(async (req, res) => {
  const health = await systemService.getHealth();
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Health check completed", health));
});

const getLogs = asyncHandler(async (req, res) => {
  const { limit, skip, type } = req.query;
  const result = await systemService.getLogs({
    limit: limit ? parseInt(limit, 10) : undefined,
    skip: skip ? parseInt(skip, 10) : undefined,
    type: type || undefined
  });
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Logs fetched successfully", result));
});

const getErrors = asyncHandler(async (req, res) => {
  const { limit, skip } = req.query;
  const result = await systemService.getErrors({
    limit: limit ? parseInt(limit, 10) : undefined,
    skip: skip ? parseInt(skip, 10) : undefined
  });
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Errors fetched successfully", result));
});

const getBackupStatus = asyncHandler(async (req, res) => {
  const status = systemService.getBackupStatus();
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Backup status fetched", status));
});

const runBackup = asyncHandler(async (req, res) => {
  const status = await systemService.runBackup();
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Backup run completed", status));
});

module.exports = {
  getHealth,
  getLogs,
  getErrors,
  getBackupStatus,
  runBackup
};
