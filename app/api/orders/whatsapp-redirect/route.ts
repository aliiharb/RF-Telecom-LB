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

const MAX_ORDER_ITEMS = 25;
const MAX_CUSTOMER_FIELD_LENGTH = 160;
const MAX_ADDRESS_LENGTH = 500;
const MAX_NOTES_LENGTH = 1000;
const MAX_PRODUCT_FIELD_LENGTH = 200;

const orderSchema = z.object({
  fullName: z.string().trim().min(1).max(MAX_CUSTOMER_FIELD_LENGTH),
  phone: z.string().trim().min(1).max(40),
  address: z.string().trim().min(1).max(MAX_ADDRESS_LENGTH),
  deliveryMethod: z.enum(["Delivery", "Pickup"]),
  notes: z.string().trim().max(MAX_NOTES_LENGTH).optional().nullable(),
  sessionId: z.string().trim().max(128).optional(),
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(MAX_PRODUCT_FIELD_LENGTH),
        brand: z.string().trim().max(MAX_PRODUCT_FIELD_LENGTH).optional().nullable(),
        sku: z.string().trim().max(MAX_PRODUCT_FIELD_LENGTH).optional().nullable(),
        category: z.string().trim().max(MAX_PRODUCT_FIELD_LENGTH).optional().nullable(),
        quantity: z.number().int().positive().max(999),
        price: z.number().nonnegative().max(999999999).optional().nullable(),
        currency: z.string().trim().max(12).optional().nullable(),
      }),
    )
    .min(1)
    .max(MAX_ORDER_ITEMS),
});

async function readJson(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const json = await readJson(request);
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

  return NextResponse.json({ whatsappUrl });
}
