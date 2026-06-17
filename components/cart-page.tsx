"use client";

// RF Telecom LB - UX/UI pass
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { trackClientEvent } from "@/lib/client-analytics";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/components/cart-provider";

export function CartPage() {
  const { items, updateQuantity, removeItem, total, hasOnlyPricedItems } = useCart();

  if (!items.length) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-3xl font-bold tracking-[-0.03em] text-[var(--color-text-1)]">Your cart is empty</h1>
        <p className="mt-4 text-[var(--color-text-2)]">Add products and send your request directly to WhatsApp.</p>
        <Link
          href="/products"
          className="btn-primary mt-8"
        >
          Continue Shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-text-3)]">Cart</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--color-text-1)]">Selected Products</h1>
        </div>
        <Link href="/products" className="text-sm font-medium text-[var(--color-text-2)] hover:text-[var(--color-text-1)]">
          Continue Shopping
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-3">
          {items.map((item) => (
            <article key={item.id} className="grid gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:grid-cols-[120px_1fr_auto]">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-[var(--color-surface-2)]">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="120px" className="object-contain p-2" />
                ) : null}
              </div>
              <div className="grid gap-1">
                <h2 className="font-medium text-[var(--color-text-1)]">{item.name}</h2>
                <p className="text-sm text-[var(--color-text-2)]">{item.brand || "RF Telecom LB"}</p>
                <p className="text-sm text-[var(--color-text-2)]">SKU/Model: {item.sku || "N/A"}</p>
                <p className="text-sm text-[var(--color-text-2)]">{item.category}</p>
                <p className="mono-data text-sm font-medium text-[var(--color-text-1)]">
                  {formatMoney(item.price, item.currency || "USD")}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                <div className="grid h-10 grid-cols-[36px_42px_36px] overflow-hidden rounded-md border border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="flex items-center justify-center text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-1)]"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="mono-data flex items-center justify-center border-x border-[var(--color-border)] text-sm">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="flex items-center justify-center text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-1)]"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-md text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-danger)]"
                  aria-label="Remove product"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="h-fit rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="font-medium text-[var(--color-text-1)]">Order Summary</h2>
          <div className="mt-4 grid gap-3 text-sm text-[var(--color-text-2)]">
            <div className="flex justify-between">
              <span>Items</span>
              <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-3 text-base font-semibold text-[var(--color-text-1)]">
              <span>Total</span>
              <span className="mono-data">{hasOnlyPricedItems ? formatMoney(total, items[0]?.currency || "USD") : "On request"}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            onClick={() => {
              void trackClientEvent("/api/analytics/cart-event", {
                eventType: "CHECKOUT_STARTED",
                quantity: items.reduce((sum, item) => sum + item.quantity, 0),
              });
            }}
            className="btn-primary mt-6 flex h-[52px] w-full"
          >
            Proceed to Checkout
          </Link>
        </aside>
      </div>
    </section>
  );
}
