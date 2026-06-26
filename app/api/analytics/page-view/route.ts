import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateVisitor } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const pageViewSchema = z.object({
  sessionId: z.string().trim().max(128).optional(),
  path: z.string().trim().min(1).max(500).optional(),
  title: z.string().trim().max(300).optional(),
  referrer: z.string().trim().max(1000).optional(),
  utmSource: z.string().trim().max(120).optional(),
  utmMedium: z.string().trim().max(120).optional(),
  utmCampaign: z.string().trim().max(200).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = pageViewSchema.safeParse(body);
    const data = parsed.success ? parsed.data : {};
    const visitor = await getOrCreateVisitor(request, data);
    const path = data.path || "/";

    await prisma.$transaction([
      prisma.pageView.create({
        data: {
          visitorId: visitor.id,
          path,
          title: data.title || null,
        },
      }),
      prisma.visitor.update({
        where: { id: visitor.id },
        data: {
          pageViewsCount: { increment: 1 },
          lastVisitAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
