// RF Telecom LB - UX/UI pass
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductCard } from "@/components/product-card";
import { categoryDescription, getCategoryBySlug, getProducts } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  return buildMetadata({
    title: category?.name || "Category",
    path: `/categories/${categorySlug}`,
    description: category ? categoryDescription(category) : "Browse RF Telecom LB category products.",
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const products = await getProducts(
    category.parentId
      ? { subcategoryId: category.subcategoryId || undefined, subcategorySlug: category.slug }
      : { categoryId: category.categoryId || undefined, categorySlug },
  );

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          ...(category.parent ? [{ label: category.parent.name, href: `/categories/${category.parent.slug}` }] : []),
          { label: category.name },
        ]}
      />
      <div className="mt-8 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-text-3)]">
          {category.parentId ? "Subcategory" : "Category"}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--color-text-1)]">{category.name}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-2)]">{categoryDescription(category)}</p>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(category.children || []).map((subcategory) => (
          <Link
            key={subcategory.slug}
            href={`/categories/${subcategory.slug}`}
            className="filter-chip rounded-lg py-4"
          >
            {subcategory.name}
          </Link>
        ))}
      </div>
      <div className="product-grid mt-10">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {!products.length ? (
        <div className="mt-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-[var(--color-text-2)]">
          No products found.
        </div>
      ) : null}
    </section>
  );
}
