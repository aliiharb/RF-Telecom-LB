// Shows the client-side WhatsApp checkout form.
import type { Metadata } from "next";

import { OrderDetailsForm } from "@/components/order-details-form";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Checkout",
  path: "/checkout",
  description: "Enter customer details and send your RF Telecom LB order request through WhatsApp.",
});

export default function CheckoutPage() {
  return <OrderDetailsForm />;
}
