// S01 - Tiered Rate Limiter: Window Sliding & Role Multipliers
export class RateLimiter {
  constructor({ defaultLimit = 60, windowMs = 60000 } = {}) {
    this.defaultLimit = defaultLimit;
    this.windowMs = windowMs;
    this.requests = new Map(); // key -> [timestamps]
  }

  isAllowed(key, { multiplier = 1 } = {}) {
    const now = Date.now();
    const limit = this.defaultLimit * multiplier;
    const windowStart = now - this.windowMs;

    if (!this.requests.has(key)) {
      this.requests.set(key, [now]);
      return { allowed: true, remaining: limit - 1, limit };
    }

    const timestamps = this.requests.get(key).filter(t => t > windowStart);
    if (timestamps.length >= limit) {
      this.requests.set(key, timestamps);
      return { allowed: false, remaining: 0, limit, retryAfterMs: timestamps[0] + this.windowMs - now };
    }

    timestamps.push(now);
    this.requests.set(key, timestamps);
    return { allowed: true, remaining: limit - timestamps.length, limit };
  }
}
