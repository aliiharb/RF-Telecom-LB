// RF Telecom LB - UX/UI pass
import Image from "next/image";
import Link from "next/link";
import { Eye } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import type { CatalogProduct } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const image = product.images[0];
  const unavailable = product.availability === "OUT_OF_STOCK";
  const categoryLabel = [product.category?.name, product.subcategory?.name].filter(Boolean).join(" / ");

  return (
    <article className="product-card group flex flex-col">
      <div>
        <Link
          href={`/products/${product.slug}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          <div className="relative aspect-square overflow-hidden bg-[var(--color-surface-2)]">
            {image ? (
              <Image
                src={image.url}
                alt={image.alt || product.imageAltText || product.name}
                fill
                sizes="(min-width: 1280px) 260px, (min-width: 768px) 33vw, 50vw"
                className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-[var(--color-text-3)]">
                RF Telecom LB
              </div>
            )}
            {unavailable ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-stock-overlay)]">
                <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-text-1)]">
                  Out of Stock
                </span>
              </div>
            ) : null}
          </div>
        </Link>
        <div className="grid gap-3 p-4">
          <p className="line-clamp-1 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-text-3)]">
            {categoryLabel || product.brand?.name || "RF Telecom LB"}
          </p>
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-[1.4] text-[var(--color-text-1)] transition-colors duration-150 group-hover:text-[var(--color-accent)]">
              {product.name}
            </h3>
          </Link>
          <p className="mono-data text-lg font-bold text-[var(--color-text-1)]">
            {product.price ? (
              formatMoney(product.price, product.currency)
            ) : (
              <span className="text-sm font-semibold text-[var(--color-text-2)]">On request</span>
            )}
          </p>
        </div>
      </div>
      <div className="mt-auto grid gap-2 p-4 pt-0">
        {product.collectionHandle ? (
          <Link
            href={`/collections/${product.collectionHandle}`}
            className="line-clamp-1 text-sm font-medium text-[var(--color-text-2)] transition-colors duration-150 hover:text-[var(--color-accent)]"
          >
            {product.subcategory?.name}
          </Link>
        ) : null}
        <div className="flex items-center gap-2">
          <Link href={`/products/${product.slug}`} className="btn-primary h-9 min-h-9 flex-1 px-3 py-0 text-sm">
            <Eye size={15} aria-hidden="true" />
            Details
          </Link>
          <AddToCartButton
            compact
            item={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              brand: product.brand?.name,
              category: product.category?.name,
              sku: product.sku,
              price: product.price,
              currency: product.currency,
              image: image?.url,
            }}
          />
        </div>
      </div>
    </article>
  );
}
