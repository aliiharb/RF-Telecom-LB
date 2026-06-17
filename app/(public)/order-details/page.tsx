// Keeps the legacy order-details route pointed at the checkout form.
import type { Metadata } from "next";
import { OrderDetailsForm } from "@/components/order-details-form";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Order Details",
  path: "/order-details",
  description: "Enter customer details and send your RF Telecom LB order request through WhatsApp.",
});

export default function OrderDetailsPage() {
  return <OrderDetailsForm />;
}
