"use client";

// RF Telecom LB - UX/UI pass
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import type { CartItem } from "@/components/cart-provider";

export function QuantityAddToCart({ item }: { item: Omit<CartItem, "quantity"> }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="grid h-11 grid-cols-[40px_48px_40px] overflow-hidden rounded-md border border-[var(--color-border)]">
        <button
          type="button"
          className="flex items-center justify-center text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-1)]"
          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          aria-label="Decrease quantity"
        >
          <Minus size={15} />
        </button>
        <span className="mono-data flex items-center justify-center border-x border-[var(--color-border)] text-sm font-medium text-[var(--color-text-1)]">
          {quantity}
        </span>
        <button
          type="button"
          className="flex items-center justify-center text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-1)]"
          onClick={() => setQuantity((value) => value + 1)}
          aria-label="Increase quantity"
        >
          <Plus size={15} />
        </button>
      </div>
      <AddToCartButton item={item} quantity={quantity} />
    </div>
  );
}
