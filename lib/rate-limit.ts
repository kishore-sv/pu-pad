type Bucket = {
  tokens: number;
  lastRefill: number;
};

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_TOKENS = 10;
const REFILL_RATE = MAX_TOKENS / WINDOW_MS;

function getBucket(key: string): Bucket {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: MAX_TOKENS, lastRefill: now };
    buckets.set(key, bucket);
    return bucket;
  }

  const elapsed = now - bucket.lastRefill;
  const refill = elapsed * REFILL_RATE;
  bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + refill);
  bucket.lastRefill = now;
  return bucket;
}

export function checkRateLimit(key: string): boolean {
  const bucket = getBucket(key);
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return true;
  }
  return false;
}

