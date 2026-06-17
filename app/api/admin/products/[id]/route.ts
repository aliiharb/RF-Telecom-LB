import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { getProductBySlug, getProducts } from "@/lib/catalog";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;
  const product = (await getProductBySlug(id)) || (await getProducts()).find((item) => item.id === id);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PUT() {
  const auth = await requireAdminApi();
  if (auth.response) {
    return auth.response;
  }

  return NextResponse.json(
    { error: "Editing existing products is not enabled yet. Add new products from /admin/products/new." },
    { status: 501 },
  );
}

export async function DELETE() {
  const auth = await requireAdminApi();
  if (auth.response) {
    return auth.response;
  }

  return NextResponse.json(
    { error: "Deleting existing products is not enabled yet." },
    { status: 501 },
  );
}
