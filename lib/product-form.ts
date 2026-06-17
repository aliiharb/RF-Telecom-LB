import type { Prisma } from "@/lib/generated/prisma/client";
import { slugify } from "@/lib/site";

export function parseSpecifications(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") {
    return {};
  }

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, line) => {
      const [key, ...rest] = line.split(":");
      if (key && rest.length) {
        acc[key.trim()] = rest.join(":").trim();
      }
      return acc;
    }, {});
}

export function specificationsToLines(specifications?: Record<string, string> | null) {
  if (!specifications) {
    return "";
  }

  return Object.entries(specifications)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

export function enumAvailability(value: FormDataEntryValue | null) {
  const availability = typeof value === "string" ? value : "ON_REQUEST";

  if (["IN_STOCK", "OUT_OF_STOCK", "ON_REQUEST"].includes(availability)) {
    return availability as "IN_STOCK" | "OUT_OF_STOCK" | "ON_REQUEST";
  }

  return "ON_REQUEST";
}

export function productDataFromFormData(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || slugify(name)).trim();
  const priceValue = String(formData.get("price") || "").trim();
  const brandId = String(formData.get("brandId") || "").trim();
  const categoryId = String(formData.get("categoryId") || "").trim();
  const subcategoryId = String(formData.get("subcategoryId") || "").trim();

  const data: Prisma.ProductCreateInput = {
    name,
    slug: slugify(slug || name),
    brand: brandId ? { connect: { id: brandId } } : undefined,
    category: categoryId ? { connect: { id: categoryId } } : undefined,
    subcategory: subcategoryId ? { connect: { id: subcategoryId } } : undefined,
    sku: String(formData.get("sku") || "").trim() || null,
    shortDescription: String(formData.get("shortDescription") || "").trim() || null,
    fullDescription: String(formData.get("fullDescription") || "").trim() || null,
    specifications: parseSpecifications(formData.get("specifications")),
    price: priceValue ? priceValue : null,
    currency: String(formData.get("currency") || "USD").trim() || "USD",
    availability: enumAvailability(formData.get("availability")),
    featured: formData.get("featured") === "on" || formData.get("featured") === "true",
    published: formData.get("published") === "on" || formData.get("published") === "true",
    metaTitle: String(formData.get("metaTitle") || "").trim() || null,
    metaDescription: String(formData.get("metaDescription") || "").trim() || null,
    metaKeywords: String(formData.get("metaKeywords") || "").trim() || null,
    imageAltText: String(formData.get("imageAltText") || "").trim() || null,
  };

  return data;
}
