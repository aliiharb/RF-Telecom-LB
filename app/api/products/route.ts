import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";

export const runtime = "nodejs";

const MAX_TAKE = 100;

function parseTake(value: string | null) {
  if (!value) return undefined;
  const take = Number(value);
  if (!Number.isFinite(take) || take <= 0) return undefined;
  return Math.min(Math.floor(take), MAX_TAKE);
}

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
    take: parseTake(searchParams.get("take")),
  });

  return NextResponse.json({ products, total: products.length });
}
