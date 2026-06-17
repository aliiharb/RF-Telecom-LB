import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { getProductSeoSlugs } from "@/lib/catalog";
import { STATIC_PAGES } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const slugs = await getProductSeoSlugs();
  const now = new Date();

  return [
    ...STATIC_PAGES.map((page) => ({
      url: `${siteUrl}${page.path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: page.path === "/" ? 1 : 0.8,
    })),
    ...slugs.categories.map((category) => ({
      url: `${siteUrl}/categories/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...slugs.collections.map((collection) => ({
      url: `${siteUrl}/collections/${collection.slug}`,
      lastModified: collection.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...slugs.products.map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...slugs.brands.map((brand) => ({
      url: `${siteUrl}/brands/${brand.slug}`,
      lastModified: brand.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
