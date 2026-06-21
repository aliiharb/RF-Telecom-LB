import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const products = await getProducts({
    search: searchParams.get("search") || undefined,
    categoryId: searchParams.get("category_id") || searchParams.get("categoryId") || undefined,
    subcategoryId: searchParams.get("subcategory_id") || searchParams.get("subcategoryId") || undefined,
    categorySlug: searchParams.get("category") || undefined,
    subcategorySlug: searchParams.get("subcategorySlug") || searchParams.get("subcategory") || undefined,
    brandSlug: searchParams.get("brand") || undefined,
    collectionSlug: searchParams.get("collection") || undefined,
    minPrice: searchParams.get("minPrice") || undefined,
    maxPrice: searchParams.get("maxPrice") || undefined,
    sort: searchParams.get("sort") || undefined,
    take: searchParams.get("take") ? Number(searchParams.get("take")) : undefined,
  });

  return NextResponse.json({ products, total: products.length });
}
