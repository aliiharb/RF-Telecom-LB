// RF Telecom LB - UX/UI pass
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductCard } from "@/components/product-card";
import { getProductsByCollection, getSubcategoryByHandle } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collectionHandle: string }>;
}): Promise<Metadata> {
  const { collectionHandle } = await params;
  const subcategory = await getSubcategoryByHandle(collectionHandle);

  return buildMetadata({
    title: subcategory?.name || "Collection",
    path: `/collections/${collectionHandle}`,
    description: subcategory
      ? `Browse ${subcategory.name} products at RF Telecom LB.`
      : "Browse RF Telecom LB collection products.",
  });
}

export default async function CollectionPage({ params }: { params: Promise<{ collectionHandle: string }> }) {
  const { collectionHandle } = await params;
  const [subcategory, products] = await Promise.all([
    getSubcategoryByHandle(collectionHandle),
    getProductsByCollection(collectionHandle),
  ]);

  if (!subcategory) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          ...(subcategory.parent ? [{ label: subcategory.parent.name, href: `/categories/${subcategory.parent.slug}` }] : []),
          { label: subcategory.name },
        ]}
      />
      <div className="mt-8 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-text-3)]">Collection</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--color-text-1)]">{subcategory.name}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-2)]">
          Products in the <span className="font-medium">{collectionHandle}</span> collection.
        </p>
      </div>
      <div className="product-grid mt-8">
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
