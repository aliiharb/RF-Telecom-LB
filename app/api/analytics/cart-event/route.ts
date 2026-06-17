import { NextRequest, NextResponse } from "next/server";
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

function isCartEventType(value: string): value is CartEventTypeValue {
  return eventTypes.includes(value as CartEventTypeValue);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = String(body.eventType || "");

    if (!isCartEventType(eventType)) {
      return NextResponse.json({ ok: true });
    }

    const visitor = await getOrCreateVisitor(request, body);
    const productId = typeof body.productId === "string" ? body.productId : undefined;
    const product = productId
      ? await prisma.product.findUnique({ where: { id: productId }, select: { id: true } })
      : null;

    await prisma.cartEvent.create({
      data: {
        visitorId: visitor.id,
        productId: product?.id,
        productName: typeof body.productName === "string" ? body.productName : null,
        eventType,
        quantity: typeof body.quantity === "number" ? body.quantity : null,
        metadata: body,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
