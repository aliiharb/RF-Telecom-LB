// RF Telecom LB - UX/UI pass
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { brandDescription, getBrandBySlug, getProductsByBrandSlug } from "@/lib/catalog";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand) {
    return buildMetadata({ title: "Brands", path: `/brands/${slug}` });
  }

  return buildMetadata({
    title: brand.seoTitle || brand.name,
    description: brand.seoDescription || brandDescription(brand),
    path: `/brands/${brand.slug}`,
  });
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand) {
    notFound();
  }

  const products = await getProductsByBrandSlug(brand.slug);

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Brands", url: "/brands" },
          { name: brand.name, url: `/brands/${brand.slug}` },
        ])}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Brands", href: "/brands" },
          { label: brand.name },
        ]}
      />
      <div className="mt-8 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-text-3)]">Brand</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--color-text-1)]">{brand.name}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-2)]">{brandDescription(brand)}</p>
      </div>
      <div className="product-grid mt-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {!products.length ? (
        <div className="mt-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-[var(--color-text-2)]">
          Products for this brand will be added soon.
        </div>
      ) : null}
    </section>
  );
}
