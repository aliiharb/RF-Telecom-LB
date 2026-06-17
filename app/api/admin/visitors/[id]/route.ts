import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;
  const visitor = await prisma.visitor.findUnique({
    where: { id },
    include: {
      pageViews: { orderBy: { createdAt: "desc" }, take: 100 },
      productViews: { orderBy: { createdAt: "desc" }, take: 100, include: { product: true } },
      searchEvents: { orderBy: { createdAt: "desc" }, take: 100 },
      cartEvents: { orderBy: { createdAt: "desc" }, take: 100, include: { product: true } },
      orders: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  if (!visitor) {
    return NextResponse.json({ error: "Visitor not found" }, { status: 404 });
  }

  return NextResponse.json({ visitor });
}
