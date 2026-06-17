// RF Telecom LB - UX/UI pass
import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { searchCatalog } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Search",
  path: "/search",
  description: "Search RF Telecom LB products, categories, and subcategories.",
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const products = query ? await searchCatalog(query) : [];

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-text-3)]">Search</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--color-text-1)]">
          {query ? `Results for "${query}"` : "Search the Catalog"}
        </h1>
      </div>
      <form action="/search" className="mb-8 flex max-w-2xl gap-3">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search products, categories, subcategories"
          className="input h-11 flex-1"
        />
        <button className="btn-primary h-11">
          Search
        </button>
      </form>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {query && !products.length ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-[var(--color-text-2)]">
          No products found.
        </div>
      ) : null}
    </section>
  );
}
