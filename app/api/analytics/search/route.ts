import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateVisitor } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const searchEventSchema = z.object({
  sessionId: z.string().trim().max(128).optional(),
  referrer: z.string().trim().max(1000).optional(),
  utmSource: z.string().trim().max(120).optional(),
  utmMedium: z.string().trim().max(120).optional(),
  utmCampaign: z.string().trim().max(200).optional(),
  term: z.string().trim().max(200).optional(),
  resultsCount: z.number().int().nonnegative().max(10000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = searchEventSchema.safeParse(body);
    const data = parsed.success ? parsed.data : {};
    const term = data.term || "";

    if (!term) {
      return NextResponse.json({ ok: true });
    }

    const visitor = await getOrCreateVisitor(request, data);

    await prisma.searchEvent.create({
      data: {
        visitorId: visitor.id,
        term,
        resultsCount: data.resultsCount ?? null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
