import { createHash, createHmac } from "node:crypto";
import type { NextRequest } from "next/server";
import { getAuthSecret } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export type VisitorPayload = {
  sessionId?: string;
  path?: string;
  title?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  userAgent?: string;
};

function boundedString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : undefined;
}

export function sanitizeVisitorPayload(payload: VisitorPayload = {}): VisitorPayload {
  return {
    sessionId: boundedString(payload.sessionId, 128),
    path: boundedString(payload.path, 500),
    title: boundedString(payload.title, 300),
    referrer: boundedString(payload.referrer, 1000),
    utmSource: boundedString(payload.utmSource, 120),
    utmMedium: boundedString(payload.utmMedium, 120),
    utmCampaign: boundedString(payload.utmCampaign, 200),
    userAgent: boundedString(payload.userAgent, 1000),
  };
}

function parseUserAgent(userAgent = "") {
  const browser = userAgent.includes("Edg")
    ? "Edge"
    : userAgent.includes("Chrome")
      ? "Chrome"
      : userAgent.includes("Firefox")
        ? "Firefox"
        : userAgent.includes("Safari")
          ? "Safari"
          : "Other";

  const operatingSystem = userAgent.includes("Windows")
    ? "Windows"
    : userAgent.includes("Android")
      ? "Android"
      : userAgent.includes("iPhone") || userAgent.includes("iPad")
        ? "iOS"
        : userAgent.includes("Mac")
          ? "macOS"
          : userAgent.includes("Linux")
            ? "Linux"
            : "Other";

  const deviceType = /Mobi|Android|iPhone/i.test(userAgent)
    ? "Mobile"
    : /iPad|Tablet/i.test(userAgent)
      ? "Tablet"
      : "Desktop";

  return { browser, operatingSystem, deviceType };
}

function hashIp(ip?: string | null) {
  if (!ip) {
    return null;
  }

  return createHmac("sha256", getAuthSecret()).update(ip).digest("hex");
}

function getIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip");
}

export function fallbackSessionId(input?: string) {
  return input || createHash("sha256").update(`${Date.now()}-${Math.random()}`).digest("hex");
}

export async function getOrCreateVisitor(request: NextRequest, payload: VisitorPayload = {}) {
  const safePayload = sanitizeVisitorPayload(payload);
  const userAgent = safePayload.userAgent || boundedString(request.headers.get("user-agent"), 1000) || "";
  const parsed = parseUserAgent(userAgent);
  const sessionId = fallbackSessionId(safePayload.sessionId);

  return prisma.visitor.upsert({
    where: { sessionId },
    create: {
      sessionId,
      ipHash: hashIp(getIp(request)),
      referrer: safePayload.referrer,
      utmSource: safePayload.utmSource,
      utmMedium: safePayload.utmMedium,
      utmCampaign: safePayload.utmCampaign,
      browser: parsed.browser,
      deviceType: parsed.deviceType,
      operatingSystem: parsed.operatingSystem,
      userAgent,
      lastVisitAt: new Date(),
    },
    update: {
      lastVisitAt: new Date(),
      referrer: safePayload.referrer || undefined,
      utmSource: safePayload.utmSource || undefined,
      utmMedium: safePayload.utmMedium || undefined,
      utmCampaign: safePayload.utmCampaign || undefined,
      browser: parsed.browser,
      deviceType: parsed.deviceType,
      operatingSystem: parsed.operatingSystem,
      userAgent,
    },
  });
}
