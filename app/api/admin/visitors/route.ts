import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) {
    return auth.response;
  }

  const visitors = await prisma.visitor.findMany({
    orderBy: { lastVisitAt: "desc" },
    take: 100,
    include: {
      pageViews: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { pageViews: true, productViews: true, cartEvents: true, orders: true } },
    },
  });

  return NextResponse.json({ visitors });
}
