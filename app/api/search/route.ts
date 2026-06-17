import { NextRequest, NextResponse } from "next/server";
import { searchCatalog } from "@/lib/catalog";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") || "").trim();

  if (!query) {
    return NextResponse.json({ products: [], total: 0 });
  }

  const products = await searchCatalog(query);

  return NextResponse.json({ products, total: products.length });
}
