import { NextResponse } from "next/server";
import { getProductsByCollection, getSubcategoryByHandle } from "@/lib/catalog";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: Promise<{ collectionHandle: string }> }) {
  const { collectionHandle } = await context.params;
  const subcategory = await getSubcategoryByHandle(collectionHandle);

  if (!subcategory) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  const products = await getProductsByCollection(collectionHandle);

  return NextResponse.json({ collection: subcategory, products, total: products.length });
}
