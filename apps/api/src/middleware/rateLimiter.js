import { RateLimitExceededException } from "../core/errors.js";

/**
 * In-memory rate limiter replacing Redis for local/standalone operation.
 */
export function createRateLimiter({ windowMs, maxRequests, keyPrefix }) {
  const store = new Map();

  // Periodic cleanup of expired window entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || "127.0.0.1";
    const key = `rl:${keyPrefix}:${ip}`;
    const now = Date.now();

    let record = store.get(key);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      store.set(key, record);
      return next();
    }

    record.count += 1;
    if (record.count > maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.set("Retry-After", String(retryAfter));
      return next(new RateLimitExceededException(retryAfter));
    }

    next();
  };
}

export const globalLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
  keyPrefix: "global",
});

export const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  keyPrefix: "auth",
});

export const handshakeLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  keyPrefix: "handshake",
});
