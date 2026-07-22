import { NextResponse } from "next/server";

// In-memory rate limiter with cleanup to prevent memory leaks
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

// Clean up expired records every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
      if (now - record.lastReset > 60000) {
        // 1 min window assumption for cleanup
        rateLimitMap.delete(ip);
      }
    }
  },
  5 * 60 * 1000,
);

export function rateLimit(ip: string, limit: number, windowMs: number) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.lastReset > windowMs) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return { success: true };
  }

  if (record.count >= limit) {
    return { success: false };
  }

  record.count += 1;
  return { success: true };
}

export function checkCSRF(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");

  // Only enforce in production, or if origin exists
  if (process.env.NODE_ENV === "production" && origin) {
    const originUrl = new URL(origin);
    if (originUrl.host !== host) {
      return false;
    }
  }
  return true;
}
