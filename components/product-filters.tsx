// RF Telecom LB - UX/UI pass
import type { CatalogCategory } from "@/lib/catalog";
import clsx from "clsx";
import Link from "next/link";

type SearchParams = {
  search?: string;
  category?: string;
  category_id?: string;
  collection?: string;
  subcategory?: string;
  subcategory_id?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
};

export function ProductFilters({
  categories,
  searchParams,
}: {
  categories: CatalogCategory[];
  searchParams: SearchParams;
}) {
  const activeCategory = categories.find(
    (category) =>
      category.slug === searchParams.category ||
      Boolean(searchParams.category_id && category.categoryId === searchParams.category_id),
  );
  const subcategories = activeCategory?.children || categories.flatMap((category) => category.children || []);

  return (
    <form
      action="/products"
      className="grid gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm lg:sticky lg:top-36"
    >
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text-1)]">Filter Products</h2>
        <p className="mt-1 text-xs leading-5 text-[var(--color-text-2)]">Search by product, category, or subcategory.</p>
      </div>

      <div className="grid gap-2">
        <p className="text-xs font-semibold uppercase text-[var(--color-text-3)]">Categories</p>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className={clsx(
                "filter-chip",
                searchParams.category === category.slug ||
                  Boolean(searchParams.category_id && category.categoryId === searchParams.category_id)
                  ? "active"
                  : "",
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      <input
        name="search"
        defaultValue={searchParams.search}
        placeholder="Search products"
        className="input h-11"
      />
      <select
        name="category"
        defaultValue={searchParams.category || ""}
        className="input h-11"
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.slug} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>
      <select
        name="subcategory"
        defaultValue={searchParams.subcategory || searchParams.collection || ""}
        className="input h-11"
      >
        <option value="">{activeCategory ? `All ${activeCategory.name}` : "All subcategories"}</option>
        {subcategories.map((subcategory) => (
          <option key={subcategory.slug} value={subcategory.collectionHandle || subcategory.slug}>
            {subcategory.fullPath || subcategory.name}
          </option>
        ))}
      </select>
      <select
        name="sort"
        defaultValue={searchParams.sort || "name-az"}
        className="input h-11"
      >
        <option value="name-az">Name A-Z</option>
        <option value="category">Category</option>
      </select>
      <button
        type="submit"
        className="btn-primary h-11"
      >
        Filter
      </button>
      <Link
        href="/products"
        className="btn-ghost"
      >
        Clear all filters
      </Link>
    </form>
  );
}
