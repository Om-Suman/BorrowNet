import { getRedis } from '../core/redis.js';
import { RateLimitExceededException } from '../core/errors.js';

export function createRateLimiter({ windowMs, maxRequests, keyPrefix }) {
  return async (req, res, next) => {
    const redis = getRedis();
    if (!redis) {
      // Graceful degradation if Redis is unavailable
      return next();
    }

    const ip = req.ip || req.connection.remoteAddress;
    const key = `rl:${keyPrefix}:${ip}`;

    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.pexpire(key, windowMs);
      }

      if (current > maxRequests) {
        const retryAfter = Math.ceil(windowMs / 1000);
        res.set('Retry-After', retryAfter);
        return next(new RateLimitExceededException(retryAfter));
      }

      next();
    } catch (error) {
      next();
    }
  };
}

export const globalLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
  keyPrefix: 'global',
});

export const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
  keyPrefix: 'auth',
});

export const handshakeLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  keyPrefix: 'handshake',
});
