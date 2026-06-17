// RF Telecom LB - UX/UI pass
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { ProductViewTracker } from "@/components/analytics-tracker";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { QuantityAddToCart } from "@/components/quantity-add-to-cart";
import {
  categoryDescription,
  getProductOrCategoryBySlug,
  getProducts,
  getRelatedProducts,
  productDescription,
} from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProductOrCategoryBySlug(slug);

  if (!result) {
    return buildMetadata({ title: "Products", path: `/products/${slug}` });
  }

  if (result.type === "category") {
    return buildMetadata({
      title: result.category.seoTitle || result.category.name,
      description: result.category.seoDescription || categoryDescription(result.category),
      path: `/categories/${result.category.slug}`,
    });
  }

  return buildMetadata({
    title: result.product.metaTitle || result.product.name,
    description: productDescription(result.product),
    path: `/products/${result.product.slug}`,
  });
}

export default async function ProductSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getProductOrCategoryBySlug(slug);

  if (!result) {
    notFound();
  }

  if (result.type === "category") {
    const products = await getProducts({ categorySlug: result.category.slug });

    return (
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Categories", url: "/categories" },
            { name: result.category.name, url: `/categories/${result.category.slug}` },
          ])}
        />
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Categories", href: "/categories" },
            { label: result.category.name },
          ]}
        />
        <div className="mt-8 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-text-3)]">Category</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--color-text-1)]">{result.category.name}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-2)]">{categoryDescription(result.category)}</p>
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

  const product = result.product;
  const related = await getRelatedProducts(product);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
      <ProductViewTracker productId={product.id} productSlug={product.slug} productName={product.name} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Products", url: "/products" },
          ...(product.category
            ? [{ name: product.category.name, url: `/categories/${product.category.slug}` }]
            : []),
          { name: product.name, url: `/products/${product.slug}` },
        ])}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          ...(product.category ? [{ label: product.category.name, href: `/categories/${product.category.slug}` }] : []),
          ...(product.subcategory
            ? [{ label: product.subcategory.name, href: `/collections/${product.subcategory.collectionHandle}` }]
            : []),
          { label: product.name },
        ]}
      />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          {product.images.length ? (
            <ProductGallery images={product.images} name={product.name} />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] text-sm text-[var(--color-text-3)]">
              RF Telecom LB
            </div>
          )}
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-accent)]">
            {[product.category?.name, product.subcategory?.name].filter(Boolean).join(" / ")}
          </p>
          <h1 className="mt-3 text-[clamp(1.4rem,2.5vw,2rem)] font-bold leading-tight tracking-[-0.03em] text-[var(--color-text-1)]">
            {product.name}
          </h1>
          <div className="mono-data mt-5 text-2xl font-bold text-[var(--color-text-1)]">
            {product.price ? formatMoney(product.price, product.currency) : "On request"}
          </div>
          <div className="mt-6">
            <QuantityAddToCart
              item={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                brand: product.brand?.name,
                category: product.category?.name,
                sku: product.sku,
                price: product.price,
                currency: product.currency,
                image: product.images[0]?.url,
              }}
            />
          </div>
          <dl className="mt-6 overflow-hidden rounded-lg border border-[var(--color-border)] text-sm">
            {[
              ["Category", product.category?.name || "N/A"],
              ["Subcategory", product.subcategory?.name || "N/A"],
              ["Collection handle", product.collectionHandle || "N/A"],
              ["SKU/Model", product.sku || "N/A"],
            ].map(([label, value], index) => (
              <div
                key={label}
                className={`grid gap-1 px-4 py-3 sm:grid-cols-[160px_1fr] ${
                  index % 2 === 0 ? "bg-[var(--color-surface)]" : "bg-[var(--color-surface-2)]"
                }`}
              >
                <dt className="text-[var(--color-text-2)]">{label}</dt>
                <dd className="text-[var(--color-text-1)]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {related.length ? (
        <section className="mt-12">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-text-3)]">Related products</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[var(--color-text-1)]">From the same subcategory</h2>
          </div>
          <div className="product-grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
