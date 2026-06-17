import { NextResponse } from "next/server";
import { getCategories } from "@/lib/catalog";

export const runtime = "nodejs";

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json({ categories });
}
