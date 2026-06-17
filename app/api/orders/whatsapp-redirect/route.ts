import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateVisitor } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";
import {
  buildWhatsAppOrderMessage,
  buildWhatsAppUrl,
  calculateTotal,
  type WhatsAppCartItem,
} from "@/lib/whatsapp";

export const runtime = "nodejs";

const orderSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().min(1),
  deliveryMethod: z.enum(["Delivery", "Pickup"]),
  notes: z.string().optional().nullable(),
  sessionId: z.string().optional(),
  items: z
    .array(
      z.object({
        name: z.string(),
        brand: z.string().optional().nullable(),
        sku: z.string().optional().nullable(),
        category: z.string().optional().nullable(),
        quantity: z.number().int().positive(),
        price: z.number().optional().nullable(),
        currency: z.string().optional().nullable(),
      }),
    )
    .min(1),
});

export async function POST(request: NextRequest) {
  const json = await request.json();
  const parsed = orderSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order details" }, { status: 400 });
  }

  const data = parsed.data;
  const items = data.items as WhatsAppCartItem[];
  const message = buildWhatsAppOrderMessage(
    {
      fullName: data.fullName,
      phone: data.phone,
      address: data.address,
      deliveryMethod: data.deliveryMethod,
      notes: data.notes,
    },
    items,
  );
  const whatsappUrl = buildWhatsAppUrl(message);

  try {
    const visitor = await getOrCreateVisitor(request, {
      sessionId: data.sessionId,
      userAgent: request.headers.get("user-agent") || undefined,
    });
    const total = calculateTotal(items);

    await prisma.whatsAppOrder.create({
      data: {
        visitorId: visitor.id,
        customerName: data.fullName,
        phone: data.phone,
        address: data.address,
        deliveryMethod: data.deliveryMethod === "Delivery" ? "DELIVERY" : "PICKUP",
        notes: data.notes,
        cartItems: items,
        total,
        currency: items.find((item) => item.currency)?.currency || "USD",
        status: "WHATSAPP_REDIRECTED",
      },
    });
  } catch {
    // WhatsApp redirection remains the source of truth for the shopper flow.
  }

  return NextResponse.json({ whatsappUrl, message });
}
