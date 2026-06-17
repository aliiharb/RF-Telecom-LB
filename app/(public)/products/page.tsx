// RF Telecom LB - UX/UI pass
import type { Metadata } from "next";
import { SearchTracker } from "@/components/analytics-tracker";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import { getCategories, getCollections, getProducts } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const collectionSlug = typeof params.collection === "string" ? params.collection : "";
  const collections = await getCollections();
  const collection = collections.find((item) => item.slug === collectionSlug);

  if (collection) {
    return buildMetadata({
      title: collection.name,
      path: `/products?collection=${collection.slug}`,
      description: `Browse ${collection.name.toLowerCase()} products at RF Telecom LB Lebanon`,
    });
  }

  return buildMetadata({
    title: "Products",
    path: "/products",
    description: "Browse RF Telecom LB products by category, subcategory, collection handle, or search term.",
  });
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const category = typeof params.category === "string" ? params.category : "";
  const categoryId = typeof params.category_id === "string" ? params.category_id : "";
  const subcategory = typeof params.subcategory === "string" ? params.subcategory : "";
  const subcategoryId = typeof params.subcategory_id === "string" ? params.subcategory_id : "";
  const collection = typeof params.collection === "string" ? params.collection : "";
  const brand = typeof params.brand === "string" ? params.brand : "";
  const minPrice = typeof params.minPrice === "string" ? params.minPrice : "";
  const maxPrice = typeof params.maxPrice === "string" ? params.maxPrice : "";
  const sort = typeof params.sort === "string" ? params.sort : "name-az";

  const [products, categories, collections] = await Promise.all([
    getProducts({
      search,
      categoryId,
      subcategoryId,
      categorySlug: category,
      subcategorySearch: subcategory,
      collectionSlug: collection,
      brandSlug: brand,
      minPrice,
      maxPrice,
      sort,
    }),
    getCategories(),
    getCollections(),
  ]);
  const activeCollection = collections.find((item) => item.slug === collection);
  const activeCategory = categories.find((item) => item.slug === category || item.categoryId === categoryId);

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <SearchTracker term={search} resultsCount={products.length} />
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-text-3)]">Products</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--color-text-1)]">
          {activeCollection?.name || activeCategory?.name || "RF Telecom LB Catalog"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-2)]">
          Explore the RF Telecom catalog from Supabase. Products are organized by category and
          subcategory, with each product linking to its original RF Telecom product page.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <ProductFilters
          categories={categories}
          searchParams={{ search, category, category_id: categoryId, collection, subcategory, subcategory_id: subcategoryId, brand, minPrice, maxPrice, sort }}
        />
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--color-text-2)]">
              {products.length} {products.length === 1 ? "product" : "products"} found
            </p>
            <p className="text-sm text-[var(--color-text-3)]">Sort: {sort.replaceAll("-", " ")}</p>
          </div>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {!products.length ? (
            <div className="mt-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-[var(--color-text-2)] shadow-sm">
              No products matched your filters.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
