import { Redis } from "ioredis";
import config from "../config/index.js";
import logger from "./logger.js";

let redisClient = null;

if (config.isTest) {
  // Mock Redis for testing
  redisClient = {
    get: async () => null,
    set: async () => "OK",
    setex: async () => "OK",
    del: async () => 1,
    incr: async () => 1,
    pexpire: async () => 1,
  };
} else {
  let hasLoggedUnavailable = false;

  redisClient = new Redis(config.redis.url, {
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy: (times) => {
      if (times > 3) {
        if (!hasLoggedUnavailable) {
          logger.warn(
            "Redis unavailable. Running in graceful degradation mode (memory/db fallback).",
          );
          hasLoggedUnavailable = true;
        }
        return null; // Stop retrying
      }
      return 1000;
    },
    maxRetriesPerRequest: 1,
  });

  redisClient.connect().catch((err) => {
    if (!hasLoggedUnavailable) {
      logger.warn(
        "Redis unavailable. Running in graceful degradation mode (memory/db fallback).",
      );
      hasLoggedUnavailable = true;
    }
  });

  redisClient.on("connect", () => {
    logger.info("Connected to Redis");
  });

  redisClient.on("error", (err) => {
    // Suppress repeated connection refused errors when Redis is not running
    if (err.code !== "ECONNREFUSED" && !hasLoggedUnavailable) {
      logger.warn("Redis client error", { error: err.message });
    }
  });
}

export const redis = redisClient;

export function getRedis() {
  if (!config.isTest && redisClient && redisClient.status !== "ready") {
    return null;
  }
  return redisClient;
}
