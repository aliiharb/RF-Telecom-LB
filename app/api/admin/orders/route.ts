import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) {
    return auth.response;
  }

  const orders = await prisma.whatsAppOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { visitor: true },
  });

  return NextResponse.json({ orders });
}
