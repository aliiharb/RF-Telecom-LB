import { NextRequest, NextResponse } from "next/server";
import { searchCatalog } from "@/lib/catalog";

export const runtime = "nodejs";

const MAX_SEARCH_LENGTH = 200;

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") || "").trim().slice(0, MAX_SEARCH_LENGTH);

  if (!query) {
    return NextResponse.json({ products: [], total: 0 });
  }

  const products = await searchCatalog(query);

  return NextResponse.json({ products, total: products.length });
}
