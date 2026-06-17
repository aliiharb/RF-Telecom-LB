import { NextRequest, NextResponse } from "next/server";
import { getOrCreateVisitor } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const visitor = await getOrCreateVisitor(request, body);
    const productId = typeof body.productId === "string" ? body.productId : undefined;
    const product = productId
      ? await prisma.product.findUnique({ where: { id: productId }, select: { id: true } })
      : null;

    await prisma.productView.create({
      data: {
        visitorId: visitor.id,
        productId: product?.id,
        productSlug: typeof body.productSlug === "string" ? body.productSlug : null,
        productName: typeof body.productName === "string" ? body.productName : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
