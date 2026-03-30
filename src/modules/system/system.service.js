const mongoose = require("mongoose");
const SystemLog = require("../../models/SystemLog.model");
const { getRedisClient } = require("../../config/redis");

// Mock backup state (in-memory). Simulated only.
let backupState = {
  lastRun: null,
  status: "idle", // idle | running | completed | failed
  message: null
};

/**
 * Application health check: MongoDB + Redis.
 */
const getHealth = async () => {
  const mongoOk = mongoose.connection.readyState === 1;
  let redisOk = false;
  try {
    const redis = getRedisClient();
    await redis.ping();
    redisOk = true;
  } catch (e) {
    // Redis down or not initialized
  }
  const healthy = mongoOk && redisOk;
  return {
    status: healthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    checks: {
      mongo: { status: mongoOk ? "up" : "down" },
      redis: { status: redisOk ? "up" : "down" }
    }
  };
};

/**
 * List system logs (request + error). Paginated.
 */
const getLogs = async (options = {}) => {
  const { limit = 100, skip = 0, type } = options;
  const filter = type ? { type } : {};
  const logs = await SystemLog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Math.min(limit, 500))
    .lean();
  const total = await SystemLog.countDocuments(filter);
  return { logs, total, limit, skip };
};

/**
 * List error logs only (type: error).
 */
const getErrors = async (options = {}) => {
  const { logs, total, limit, skip } = await getLogs({ ...options, type: "error" });
  return { errors: logs, total, limit, skip };
};

/**
 * Backup status (mock).
 */
const getBackupStatus = () => {
  return {
    status: backupState.status,
    lastRun: backupState.lastRun,
    message: backupState.message
  };
};

/**
 * Trigger backup (mock). Simulates async backup.
 */
const runBackup = async () => {
  if (backupState.status === "running") {
    return { status: "running", message: "Backup already in progress" };
  }
  backupState.status = "running";
  backupState.message = "Backup simulation started";

  // Simulate delay
  await new Promise((r) => setTimeout(r, 1500));
  backupState.status = "completed";
  backupState.lastRun = new Date().toISOString();
  backupState.message = "Backup simulation completed successfully";
  return getBackupStatus();
};

module.exports = {
  getHealth,
  getLogs,
  getErrors,
  getBackupStatus,
  runBackup
};
