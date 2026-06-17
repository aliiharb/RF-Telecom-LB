"use client";

import { useEffect, useState } from "react";

type CatalogViewerProduct = {
  id: string;
  name: string;
  category?: { name?: string | null } | null;
  subcategory?: { name?: string | null } | null;
  collectionHandle?: string | null;
};

type CatalogViewerCategory = {
  id: string;
  name: string;
};

export function SupabaseCatalogViewer() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<CatalogViewerProduct[]>([]);
  const [categories, setCategories] = useState<CatalogViewerCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      setLoading(true);
      setError("");

      try {
        const productUrl = search.trim()
          ? `/api/search?q=${encodeURIComponent(search.trim())}`
          : "/api/products?take=100";
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch(productUrl),
          fetch("/api/categories"),
        ]);

        if (!productsResponse.ok || !categoriesResponse.ok) {
          throw new Error("Failed to load catalog data.");
        }

        const productData = (await productsResponse.json()) as { products?: CatalogViewerProduct[] };
        const categoryData = (await categoriesResponse.json()) as { categories?: CatalogViewerCategory[] };

        if (!cancelled) {
          setProducts(productData.products || []);
          setCategories(categoryData.categories || []);
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
          setError("Failed to load products.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    const timer = window.setTimeout(loadCatalog, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.16em] text-zinc-500">Supabase Catalog</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Catalog Viewer</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          Read-only view of products grouped by the current categories and subcategories.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_280px]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products, categories, subcategories"
          className="h-11 rounded-md border border-zinc-200 px-3 text-sm outline-none transition focus:border-blue-700"
        />
        <div className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
          {categories.length} categories
        </div>
      </div>

      {loading ? (
        <div className="rounded-md border border-zinc-200 bg-white p-8 text-zinc-600">Loading products...</div>
      ) : null}
      {error ? <div className="rounded-md border border-red-200 bg-red-50 p-8 text-red-700">{error}</div> : null}
      {!loading && !error && !products.length ? (
        <div className="rounded-md border border-zinc-200 bg-white p-8 text-center text-zinc-600">
          No products found.
        </div>
      ) : null}
      {!loading && !error && products.length ? (
        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Subcategory</th>
                <th className="px-4 py-3">Collection Handle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 font-medium text-zinc-950">{product.name}</td>
                  <td className="px-4 py-3 text-zinc-600">{product.category?.name || "N/A"}</td>
                  <td className="px-4 py-3 text-zinc-600">{product.subcategory?.name || "N/A"}</td>
                  <td className="px-4 py-3 text-zinc-600">{product.collectionHandle || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}
