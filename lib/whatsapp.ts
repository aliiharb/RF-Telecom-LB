import { getWhatsAppOrderNumber } from "@/lib/env";
import { formatMoney } from "@/lib/format";

export type WhatsAppCartItem = {
  name: string;
  brand?: string | null;
  sku?: string | null;
  category?: string | null;
  quantity: number;
  price?: number | null;
  currency?: string | null;
};

export type WhatsAppCustomerDetails = {
  fullName: string;
  phone: string;
  address: string;
  deliveryMethod: "Delivery" | "Pickup";
  notes?: string | null;
};

export function calculateTotal(items: WhatsAppCartItem[]) {
  const pricedItems = items.filter((item) => typeof item.price === "number");

  if (pricedItems.length !== items.length || pricedItems.length === 0) {
    return null;
  }

  return pricedItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
}

export function buildWhatsAppOrderMessage(
  customer: WhatsAppCustomerDetails,
  items: WhatsAppCartItem[],
) {
  const total = calculateTotal(items);
  const currency = items.find((item) => item.currency)?.currency || "USD";
  const productLines = items
    .map((item, index) => {
      const price =
        typeof item.price === "number" ? formatMoney(item.price, item.currency || "USD") : "On request";

      return `${index + 1}. ${item.name}
   Brand: ${item.brand || "N/A"}
   SKU/Model: ${item.sku || "N/A"}
   Category: ${item.category || "N/A"}
   Quantity: ${item.quantity}
   Price: ${price}`;
    })
    .join("\n\n");

  return `New RF Telecom LB Order

Customer Details:
Name: ${customer.fullName}
Phone: ${customer.phone}
Address: ${customer.address}
Delivery Method: ${customer.deliveryMethod}
Notes: ${customer.notes || "N/A"}

Products:
${productLines}
${total !== null ? `\n\nTotal: ${formatMoney(total, currency)}` : ""}`;
}

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${getWhatsAppOrderNumber()}?text=${encodeURIComponent(message)}`;
}
