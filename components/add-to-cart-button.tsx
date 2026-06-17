"use client";

// RF Telecom LB - UX/UI pass
import { ShoppingBag } from "lucide-react";
import type { CartItem } from "@/components/cart-provider";
import { useCart } from "@/components/cart-provider";

export function AddToCartButton({
  item,
  quantity = 1,
  compact = false,
}: {
  item: Omit<CartItem, "quantity">;
  quantity?: number;
  compact?: boolean;
}) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      onClick={() => addItem(item, quantity)}
      aria-label={`Add ${item.name} to cart`}
      className={
        compact
          ? "inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm font-semibold text-[var(--color-text-1)] transition-colors duration-150 hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          : "btn-primary"
      }
    >
      <ShoppingBag size={16} aria-hidden="true" />
      <span className={compact ? "sr-only" : ""}>Add to Cart</span>
    </button>
  );
}
