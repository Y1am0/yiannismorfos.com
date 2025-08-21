"use server";

import { cookies, headers } from "next/headers";
import { createHmac } from "node:crypto";

// Limits
const BUCKET_CAPACITY = 4; // max burst per visitor
const BUCKET_REFILL_MS = 6000; // 1 token every 6s
const WIN5_LIMIT = 18; // per rolling 5 minutes per visitor
const DAILY_LIMIT = 50; // per 24h per visitor

// IP-level limits
const IP_BUCKET_CAPACITY = 8; // allow some concurrency behind NAT
const IP_BUCKET_REFILL_MS = 4000; // slightly faster IP refill
const IP_WIN5_LIMIT = 80; // generous: multiple users can chat

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number; // seconds
  reason?: "burst" | "window" | "daily" | "ip";
}

// In-memory store (non-distributed). Good enough for single instance / hobby.
interface MemoryEntry {
  bucketTokens: number;
  bucketUpdated: number;
  win5: number[]; // timestamps
  day: number[]; // timestamps
}
const memoryStore: Record<string, MemoryEntry> = {};

interface IpEntry {
  bucketTokens: number;
  bucketUpdated: number;
  win5: number[];
}
const memoryIpStore: Record<string, IpEntry> = {};

function hash(input: string) {
  let h = 0; // non-cryptographic
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return h.toString(36);
}

const SECRET =
  process.env.RATE_LIMIT_SECRET || process.env.NEXTAUTH_SECRET || "rl-secret";

function signId(id: string): string {
  const sig = createHmac("sha256", SECRET).update(id).digest("base64url");
  return `${id}.${sig}`;
}

function verifySignedId(signed: string | undefined | null): string | null {
  if (!signed) return null;
  const parts = signed.split(".");
  if (parts.length !== 2) return null;
  const [id, sig] = parts;
  const expected = createHmac("sha256", SECRET).update(id).digest("base64url");
  return sig === expected ? id : null;
}

async function getIdentity(): Promise<{ id: string; ipKey: string }> {
  try {
    const cookieStore = await cookies();
    const hdrs = await headers();
    const ip =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      hdrs.get("cf-connecting-ip") ||
      hdrs.get("x-real-ip") ||
      "unknown";
    const ua = hdrs.get("user-agent") || "ua";
    const ipKey = hash(ip);

    // Validate signed cookie first
    const signedCookie = cookieStore.get("who_uid_v2")?.value;
    const validCookieId = verifySignedId(signedCookie);
    if (validCookieId) {
      return { id: validCookieId, ipKey };
    }

    // Stable fingerprint fallback (not unique but better than random for no-cookies)
    const fingerprint = hash(ip + ":" + ua);

    // Try to persist a signed cookie for stability across requests
    try {
      cookieStore.set("who_uid_v2", signId(fingerprint), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    } catch {}

    return { id: fingerprint, ipKey };
  } catch {
    return { id: "anon", ipKey: "anon" }; // very edge fallback
  }
}

export async function checkWhoRateLimit(): Promise<RateLimitResult> {
  if (process.env.NODE_ENV === "development") return { allowed: true };

  const { id, ipKey } = await getIdentity();
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

  let ipEntry = memoryIpStore[ipKey];
  if (!ipEntry) {
    ipEntry = memoryIpStore[ipKey] = {
      bucketTokens: IP_BUCKET_CAPACITY,
      bucketUpdated: now,
      win5: [],
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

  // Refill IP bucket
  const ipElapsed = now - ipEntry.bucketUpdated;
  if (ipElapsed > IP_BUCKET_REFILL_MS) {
    const refill = Math.floor(ipElapsed / IP_BUCKET_REFILL_MS);
    if (refill > 0) {
      ipEntry.bucketTokens = Math.min(
        IP_BUCKET_CAPACITY,
        ipEntry.bucketTokens + refill
      );
      ipEntry.bucketUpdated = now;
    }
  }

  // Prune windows
  entry.win5 = entry.win5.filter((t) => now - t < 5 * 60 * 1000);
  entry.day = entry.day.filter((t) => now - t < 24 * 60 * 60 * 1000);
  ipEntry.win5 = ipEntry.win5.filter((t) => now - t < 5 * 60 * 1000);

  // Daily limit
  if (entry.day.length >= DAILY_LIMIT) {
    const oldest = entry.day[0];
    const retryAfter = Math.max(
      1,
      Math.ceil((24 * 60 * 60 * 1000 - (now - oldest)) / 1000)
    );
    return { allowed: false, reason: "daily", retryAfter };
  }

  // Burst bucket
  if (entry.bucketTokens <= 0) {
    const retryAfter = Math.max(
      1,
      Math.ceil((BUCKET_REFILL_MS - (now - entry.bucketUpdated)) / 1000)
    );
    return { allowed: false, reason: "burst", retryAfter };
  }

  // Rolling 5m window
  if (entry.win5.length >= WIN5_LIMIT) {
    const oldest5 = entry.win5[0];
    const retryAfter = Math.max(
      1,
      Math.ceil((5 * 60 * 1000 - (now - oldest5)) / 1000)
    );
    return { allowed: false, reason: "window", retryAfter };
  }

  // IP-level guards (so cookie rotation can't easily bypass limits)
  if (ipEntry.bucketTokens <= 0) {
    const retryAfter = Math.max(
      1,
      Math.ceil((IP_BUCKET_REFILL_MS - (now - ipEntry.bucketUpdated)) / 1000)
    );
    return { allowed: false, reason: "ip", retryAfter };
  }
  if (ipEntry.win5.length >= IP_WIN5_LIMIT) {
    const oldestIp5 = ipEntry.win5[0];
    const retryAfter = Math.max(
      1,
      Math.ceil((5 * 60 * 1000 - (now - oldestIp5)) / 1000)
    );
    return { allowed: false, reason: "ip", retryAfter };
  }

  // Consume
  entry.bucketTokens -= 1;
  entry.win5.push(now);
  entry.day.push(now);
  if (entry.win5.length > WIN5_LIMIT) entry.win5.shift();
  if (entry.day.length > DAILY_LIMIT) entry.day.shift();

  ipEntry.bucketTokens -= 1;
  ipEntry.win5.push(now);
  if (ipEntry.win5.length > IP_WIN5_LIMIT) ipEntry.win5.shift();

  return { allowed: true };
}
