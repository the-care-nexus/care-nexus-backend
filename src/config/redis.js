const { createClient } = require("redis");
const config = require("./config");

let redisClient;

const connectRedis = async () => {
  redisClient = createClient({
    url: config.redis.url
  });

  redisClient.on("error", (err) => {
    console.error("Redis Client Error", err);
  });

  await redisClient.connect();
  console.log("Redis connected");

  return redisClient;
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis client not initialized. Call connectRedis() first.");
  }
  return redisClient;
};

module.exports = {
  connectRedis,
  getRedisClient
};

