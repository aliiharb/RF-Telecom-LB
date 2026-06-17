import { NextRequest, NextResponse } from "next/server";
import { getOrCreateVisitor } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const visitor = await getOrCreateVisitor(request, body);
    const path = String(body.path || "/");

    await prisma.$transaction([
      prisma.pageView.create({
        data: {
          visitorId: visitor.id,
          path,
          title: typeof body.title === "string" ? body.title : null,
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
