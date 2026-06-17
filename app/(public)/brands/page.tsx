// RF Telecom LB - UX/UI pass
import type { Metadata } from "next";
import Link from "next/link";
import { getBrands } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Brands",
  path: "/brands",
  description:
    "Browse RF Telecom LB brands including AEG, British Telecom, Delta, Grandstream, Metas, Mikrotik, Panasonic, TP-Link, Ubiquiti, UNI-T, Yeastar, and Yealink.",
});

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-text-3)]">Brands</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--color-text-1)]">Featured Brands</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-2)]">
          Browse telecom, networking, security, electronics, testing, and power equipment by brand.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {brands.map((brand) => (
          <Link
            key={brand.slug}
            href={`/brands/${brand.slug}`}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-accent)]"
          >
            <h2 className="font-medium text-[var(--color-text-1)]">{brand.name}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-2)]">
              {brandDescriptionText(brand.description, brand.name)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function brandDescriptionText(description: string | null | undefined, name: string) {
  return description || `${name} products available from RF Telecom LB in Lebanon.`;
}
