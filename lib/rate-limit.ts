// Simple in-memory sliding-window rate limiter
// Works well for a single-instance deployment (Vercel serverless functions share no memory,
// so this guards against bursts within a single function invocation chain, not cross-request DoS).
// For multi-instance rate limiting, swap for @upstash/ratelimit.

const store = new Map<string, number[]>()

export function rateLimit(key: string, limit: number, windowMs: number): { success: boolean; remaining: number } {
  const now = Date.now()
  const windowStart = now - windowMs

  const timestamps = (store.get(key) ?? []).filter((t) => t > windowStart)
  timestamps.push(now)
  store.set(key, timestamps)

  const remaining = Math.max(0, limit - timestamps.length)
  return { success: timestamps.length <= limit, remaining }
}
