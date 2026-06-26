import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateVisitor } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type CartEventTypeValue =
  | "PRODUCT_ADDED"
  | "PRODUCT_REMOVED"
  | "QUANTITY_UPDATED"
  | "CHECKOUT_STARTED"
  | "WHATSAPP_REDIRECT_CLICKED";

const eventTypes: CartEventTypeValue[] = [
  "PRODUCT_ADDED",
  "PRODUCT_REMOVED",
  "QUANTITY_UPDATED",
  "CHECKOUT_STARTED",
  "WHATSAPP_REDIRECT_CLICKED",
];

const cartEventSchema = z.object({
  eventType: z.enum(eventTypes as [CartEventTypeValue, ...CartEventTypeValue[]]),
  sessionId: z.string().trim().max(128).optional(),
  referrer: z.string().trim().max(1000).optional(),
  utmSource: z.string().trim().max(120).optional(),
  utmMedium: z.string().trim().max(120).optional(),
  utmCampaign: z.string().trim().max(200).optional(),
  productId: z.string().trim().max(128).optional(),
  productName: z.string().trim().max(200).optional(),
  quantity: z.number().int().positive().max(999).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = cartEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: true });
    }

    const data = parsed.data;
    const visitor = await getOrCreateVisitor(request, data);
    const productId = data.productId;
    const product = productId
      ? await prisma.product.findUnique({ where: { id: productId }, select: { id: true } })
      : null;

    await prisma.cartEvent.create({
      data: {
        visitorId: visitor.id,
        productId: product?.id,
        productName: data.productName || null,
        eventType: data.eventType,
        quantity: data.quantity || null,
        metadata: {
          productId: data.productId,
          productName: data.productName,
          quantity: data.quantity,
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
