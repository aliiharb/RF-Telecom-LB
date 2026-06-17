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
  const userAgent = payload.userAgent || request.headers.get("user-agent") || "";
  const parsed = parseUserAgent(userAgent);
  const sessionId = fallbackSessionId(payload.sessionId);

  return prisma.visitor.upsert({
    where: { sessionId },
    create: {
      sessionId,
      ipHash: hashIp(getIp(request)),
      referrer: payload.referrer,
      utmSource: payload.utmSource,
      utmMedium: payload.utmMedium,
      utmCampaign: payload.utmCampaign,
      browser: parsed.browser,
      deviceType: parsed.deviceType,
      operatingSystem: parsed.operatingSystem,
      userAgent,
      lastVisitAt: new Date(),
    },
    update: {
      lastVisitAt: new Date(),
      referrer: payload.referrer || undefined,
      utmSource: payload.utmSource || undefined,
      utmMedium: payload.utmMedium || undefined,
      utmCampaign: payload.utmCampaign || undefined,
      browser: parsed.browser,
      deviceType: parsed.deviceType,
      operatingSystem: parsed.operatingSystem,
      userAgent,
    },
  });
}
