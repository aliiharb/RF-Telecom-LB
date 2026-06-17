import { NextResponse } from "next/server";
import { getCollections } from "@/lib/catalog";

export const runtime = "nodejs";

export async function GET() {
  const collections = await getCollections();

  return NextResponse.json(collections);
}
