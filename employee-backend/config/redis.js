/**
 * RetainIQ™ Redis Cache Client
 * ─────────────────────────────────────────────────────────────────────────────
 * Connects to Redis (local or cloud).  When Redis is unavailable, every cache
 * operation degrades gracefully so the app stays fully functional without it.
 *
 * Cache TTL strategy:
 *  - Dashboard stats        → 60 s   (refresh on each prediction write)
 *  - High-risk employees   → 30 s
 *  - Reports data           → 120 s
 *  - Recommendations        → 90 s
 *  - Retention playbook     → 300 s  (expensive generation, rarely changes)
 *  - Feature importance     → 600 s  (model is static between deployments)
 */

import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

let redisClient = null;
let redisAvailable = false;

// ── Connection ────────────────────────────────────────────────────────────────
function createRedisClient() {
  const client = new Redis(REDIS_URL, {
    // Fail fast on startup; don't retry forever if Redis isn't present
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      if (times >= 3) return null; // stop retrying after 3 attempts
      return Math.min(times * 200, 2000);
    },
    reconnectOnError: (err) => {
      const targetErrors = ["READONLY", "ECONNRESET"];
      return targetErrors.some((e) => err.message.includes(e));
    },
  });

  client.on("connect", () => {
    redisAvailable = true;
    console.log("✅ Redis connected:", REDIS_URL);
  });

  client.on("ready", () => {
    redisAvailable = true;
  });

  client.on("error", (err) => {
    if (redisAvailable) {
      console.warn("⚠️  Redis error (falling back to no-cache):", err.message);
    }
    redisAvailable = false;
  });

  client.on("close", () => {
    redisAvailable = false;
  });

  return client;
}

export async function connectRedis() {
  try {
    redisClient = createRedisClient();
    await redisClient.connect();
  } catch (err) {
    console.warn("⚠️  Redis unavailable — cache disabled (app will still work):", err.message);
    redisAvailable = false;
  }
}

// ── Core helpers (all safe — never throw) ────────────────────────────────────
export function isRedisUp() {
  return redisAvailable && redisClient !== null;
}

export async function cacheGet(key) {
  if (!isRedisUp()) return null;
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key, data, ttlSeconds = 60) {
  if (!isRedisUp()) return;
  try {
    await redisClient.set(key, JSON.stringify(data), "EX", ttlSeconds);
  } catch {
    /* silent */
  }
}

export async function cacheDel(key) {
  if (!isRedisUp()) return;
  try {
    await redisClient.del(key);
  } catch {
    /* silent */
  }
}

/**
 * Delete all keys matching a glob pattern.
 * e.g. invalidatePattern("dashboard:*") clears all dashboard cache entries.
 */
export async function invalidatePattern(pattern) {
  if (!isRedisUp()) return;
  try {
    // Use SCAN instead of KEYS to avoid blocking Redis on large keyspaces
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redisClient.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } while (cursor !== "0");
  } catch {
    /* silent */
  }
}

/**
 * Convenience: get from cache or run loader, store result.
 * Usage:  const data = await cached("my:key", 60, () => db.query(...));
 */
export async function cached(key, ttlSeconds, loader) {
  const hit = await cacheGet(key);
  if (hit !== null) {
    return { data: hit, fromCache: true };
  }
  const data = await loader();
  await cacheSet(key, data, ttlSeconds);
  return { data, fromCache: false };
}

export { redisClient };
export default { connectRedis, cacheGet, cacheSet, cacheDel, invalidatePattern, cached, isRedisUp };
