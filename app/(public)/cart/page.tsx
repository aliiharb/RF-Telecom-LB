import type { Metadata } from "next";
import { CartPage } from "@/components/cart-page";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Cart",
  path: "/cart",
  description: "Review selected RF Telecom LB products before sending your WhatsApp order request.",
});

export default function CartRoutePage() {
  return <CartPage />;
}
