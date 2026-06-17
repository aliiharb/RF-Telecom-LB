import { NextRequest, NextResponse } from "next/server";
import { getOrCreateVisitor } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const term = String(body.term || "").trim();

    if (!term) {
      return NextResponse.json({ ok: true });
    }

    const visitor = await getOrCreateVisitor(request, body);

    await prisma.searchEvent.create({
      data: {
        visitorId: visitor.id,
        term,
        resultsCount: typeof body.resultsCount === "number" ? body.resultsCount : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
