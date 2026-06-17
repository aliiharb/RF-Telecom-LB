// RF Telecom LB - UX/UI pass
import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Categories",
  path: "/categories",
  description: "Browse RF Telecom LB product categories and subcategories.",
});

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-text-3)]">Categories</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--color-text-1)]">Browse Categories</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-2)]">
          Explore top-level RF Telecom categories and open each subcategory collection.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <article key={category.slug} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <Link href={`/categories/${category.slug}`} className="text-lg font-semibold text-[var(--color-text-1)] hover:text-[var(--color-accent)]">
              {category.name}
            </Link>
            <div className="mt-4 grid gap-2">
              {(category.children || []).map((subcategory) => (
                <Link
                  key={subcategory.slug}
                  href={`/categories/${subcategory.slug}`}
                  className="text-sm text-[var(--color-text-2)] hover:text-[var(--color-text-1)]"
                >
                  {subcategory.name}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
      {!categories.length ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-[var(--color-text-2)]">
          No categories found.
        </div>
      ) : null}
    </section>
  );
}
