import { NextResponse } from "next/server";
import { getCategories } from "@/lib/catalog";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await context.params;
  const categories = await getCategories();
  const category = categories.find((item) => item.id === categoryId || item.slug === categoryId);

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({ subcategories: category.children || [] });
}
