import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateVisitor } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const productViewSchema = z.object({
  sessionId: z.string().trim().max(128).optional(),
  referrer: z.string().trim().max(1000).optional(),
  utmSource: z.string().trim().max(120).optional(),
  utmMedium: z.string().trim().max(120).optional(),
  utmCampaign: z.string().trim().max(200).optional(),
  productId: z.string().trim().max(128).optional(),
  productSlug: z.string().trim().max(200).optional(),
  productName: z.string().trim().max(200).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = productViewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: true });
    }

    const data = parsed.data;
    const visitor = await getOrCreateVisitor(request, data);
    const productId = data.productId;
    const product = productId
      ? await prisma.product.findUnique({ where: { id: productId }, select: { id: true } })
      : null;

    await prisma.productView.create({
      data: {
        visitorId: visitor.id,
        productId: product?.id,
        productSlug: data.productSlug || null,
        productName: data.productName || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
