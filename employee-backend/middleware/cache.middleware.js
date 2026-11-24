/**
 * RetainIQ™ — Redis Cache Middleware
 * ─────────────────────────────────────────────────────────────────────────────
 * Drop-in Express middleware for route-level response caching.
 *
 * Usage:
 *   import { cacheMiddleware } from "../middleware/cache.middleware.js";
 *   router.get("/", authMiddleware, cacheMiddleware(60), myController);
 *
 * Cache key strategy:
 *   <prefix>:<userId>:<path>?<queryString>
 *
 * Headers returned to client:
 *   X-Cache: HIT | MISS
 *   X-Cache-TTL: remaining seconds (on HIT)
 *   X-Cache-Key: the key used (useful in dev)
 *   X-Response-Time: ms
 */

import { cacheGet, cacheSet, isRedisUp, redisClient } from "../config/redis.js";

/**
 * @param {number}  ttlSeconds  Cache lifetime in seconds
 * @param {string}  [prefix]    Cache key namespace (defaults to "route")
 */
export function cacheMiddleware(ttlSeconds = 60, prefix = "route") {
  return async (req, res, next) => {
    const start = Date.now();

    // Skip caching if Redis is down
    if (!isRedisUp()) {
      res.setHeader("X-Cache", "BYPASS");
      return next();
    }

    // Build a per-user, per-query cache key
    const userId = req.user?._id?.toString() || "anon";
    const queryStr = new URLSearchParams(req.query).toString();
    const keyPath = req.path === "/" ? "root" : req.path.replace(/\//g, "_").replace(/^_/, "");
    const cacheKey = `${prefix}:${userId}:${keyPath}${queryStr ? ":" + queryStr : ""}`;

    try {
      const cached = await cacheGet(cacheKey);
      if (cached !== null) {
        // --- CACHE HIT ---
        let ttlRemaining = ttlSeconds;
        try {
          ttlRemaining = await redisClient.ttl(cacheKey);
        } catch {
          /* ignore TTL fetch failure */
        }
        res.setHeader("X-Cache", "HIT");
        res.setHeader("X-Cache-TTL", String(ttlRemaining));
        res.setHeader("X-Cache-Key", cacheKey);
        res.setHeader("X-Response-Time", `${Date.now() - start}ms`);
        return res.json(cached);
      }
    } catch {
      /* Redis read failed — fall through to real handler */
    }

    // --- CACHE MISS: intercept the response ---
    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await cacheSet(cacheKey, body, ttlSeconds);
        } catch {
          /* silent */
        }
      }
      res.setHeader("X-Cache", "MISS");
      res.setHeader("X-Cache-Key", cacheKey);
      res.setHeader("X-Response-Time", `${Date.now() - start}ms`);
      return originalJson(body);
    };

    next();
  };
}

/**
 * Force-bust all cache keys matching a glob pattern.
 * Call from mutation controllers to keep cache consistent.
 */
export { invalidatePattern } from "../config/redis.js";
