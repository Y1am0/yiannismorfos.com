"use server";

import { cookies, headers } from "next/headers";

// Option A limits with stricter daily cap
const BUCKET_CAPACITY = 4; // max burst
const BUCKET_REFILL_MS = 6000; // 1 token every 6s
const WIN5_LIMIT = 18; // per rolling 5 minutes
const DAILY_LIMIT = 50; // per 24h

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number; // seconds
  reason?: "burst" | "window" | "daily";
}

// In-memory store (non-distributed). Good enough for single instance / hobby.
interface MemoryEntry {
  bucketTokens: number;
  bucketUpdated: number;
  win5: number[]; // timestamps
  day: number[]; // timestamps
}
const memoryStore: Record<string, MemoryEntry> = {};

function hash(input: string) {
  let h = 0; // non-cryptographic
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return h.toString(36);
}

async function getIdentity(): Promise<string> {
  try {
    const cookieStore = await cookies();
    let id = cookieStore.get("who_uid")?.value;
    if (!id) {
      id = crypto.randomUUID();
      cookieStore.set("who_uid", id, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    const hdrs = await headers();
    const ip =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      hdrs.get("cf-connecting-ip") ||
      hdrs.get("x-real-ip") ||
      "unknown";
    const ua = hdrs.get("user-agent") || "ua";
    return id || hash(ip + ":" + ua);
  } catch {
    return "anon"; // very edge fallback
  }
}

export async function checkWhoRateLimit(): Promise<RateLimitResult> {
  if (process.env.NODE_ENV === "development") return { allowed: true };

  const id = await getIdentity();
  const now = Date.now();

  let entry = memoryStore[id];
  if (!entry) {
    entry = memoryStore[id] = {
      bucketTokens: BUCKET_CAPACITY,
      bucketUpdated: now,
      win5: [],
      day: [],
    };
  }

  // Refill bucket
  const elapsed = now - entry.bucketUpdated;
  if (elapsed > BUCKET_REFILL_MS) {
    const refill = Math.floor(elapsed / BUCKET_REFILL_MS);
    if (refill > 0) {
      entry.bucketTokens = Math.min(
        BUCKET_CAPACITY,
        entry.bucketTokens + refill
      );
      entry.bucketUpdated = now;
    }
  }

  // Prune windows
  entry.win5 = entry.win5.filter((t) => now - t < 5 * 60 * 1000);
  entry.day = entry.day.filter((t) => now - t < 24 * 60 * 60 * 1000);

  // Daily limit
  if (entry.day.length >= DAILY_LIMIT) {
    const oldest = entry.day[0];
    const retryAfter = Math.ceil((24 * 60 * 60 * 1000 - (now - oldest)) / 1000);
    return { allowed: false, reason: "daily", retryAfter };
  }

  // Burst bucket
  if (entry.bucketTokens <= 0) {
    const retryAfter = Math.ceil(
      (BUCKET_REFILL_MS - (now - entry.bucketUpdated)) / 1000
    );
    return { allowed: false, reason: "burst", retryAfter };
  }

  // Rolling 5m window
  if (entry.win5.length >= WIN5_LIMIT) {
    const oldest5 = entry.win5[0];
    const retryAfter = Math.ceil((5 * 60 * 1000 - (now - oldest5)) / 1000);
    return { allowed: false, reason: "window", retryAfter };
  }

  // Consume
  entry.bucketTokens -= 1;
  entry.win5.push(now);
  entry.day.push(now);

  return { allowed: true };
}
