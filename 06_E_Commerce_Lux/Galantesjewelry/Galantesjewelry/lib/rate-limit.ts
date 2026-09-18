type Bucket = {
  count: number;
  resetAt: number;
};

type CheckRateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
};

const buckets = new Map<string, Bucket>();

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return request.headers.get('x-real-ip') || 'unknown';
}

export function checkRateLimit({ key, limit, windowMs, now = Date.now() }: CheckRateLimitOptions) {
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}

export function clearRateLimitBuckets() {
  buckets.clear();
}
