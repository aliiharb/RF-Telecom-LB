import { NextRequest, NextResponse } from "next/server";
import {
  deleteAdminProduct,
  getAdminProduct,
  updateAdminProduct,
  type AdminProductInput,
  type AdminProductStatus,
} from "@/lib/admin-products";
import { requireAdminApi } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { slugify } from "@/lib/site";

export const runtime = "nodejs";

const STATUSES: AdminProductStatus[] = ["draft", "active", "archived"];

function parseNumber(value: unknown) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function parsePayload(body: Record<string, unknown>): { input?: AdminProductInput; errors?: Record<string, string> } {
  const errors: Record<string, string> = {};
  const title = String(body.title || "").trim();
  const slug = String(body.slug || slugify(title)).trim();
  const price = parseNumber(body.price);
  const weight = parseNumber(body.weight);
  const color = String(body.color || "").trim();
  const sku = String(body.sku || "").trim();
  const status = STATUSES.includes(body.status as AdminProductStatus) ? (body.status as AdminProductStatus) : "draft";
  const subcategoryIds = Array.isArray(body.subcategoryIds)
    ? body.subcategoryIds.map((id) => String(id)).filter(Boolean)
    : [];
  const brandId = body.brandId === "" || body.brandId === null || body.brandId === undefined ? null : Number(body.brandId);
  const images = Array.isArray(body.images)
    ? body.images.map((image) => image as { url: string; position?: number; isPrimary?: boolean }).filter((image) => image.url)
    : [];

  if (!title) {
    errors.title = "Title is required.";
  }
  if (!slug) {
    errors.slug = "Slug is required.";
  }
  if (body.price !== "" && body.price !== null && body.price !== undefined && (price === null || price < 0)) {
    errors.price = "Price must be 0 or greater.";
  }
  if (body.weight !== "" && body.weight !== null && body.weight !== undefined && (weight === null || weight < 0)) {
    errors.weight = "Weight must be 0 or greater.";
  }
  if (Object.keys(errors).length) {
    return { errors };
  }

  return {
    input: {
      title,
      slug: slugify(slug),
      description: String(body.description || "").trim() || null,
      price,
      weight,
      color: color || null,
      sku: sku || null,
      status,
      brandId: Number.isFinite(brandId) ? brandId : null,
      specPdfUrl: String(body.specPdfUrl || "").trim() || null,
      subcategoryIds: [...new Set(subcategoryIds)],
      images: images.map((image, index) => ({
        url: image.url,
        position: image.position ?? index,
        isPrimary: Boolean(image.isPrimary),
      })),
    },
  };
}

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await context.params;
    const product = await getAdminProduct(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    logger.error("AdminProducts", "Failed to load product.", error);
    return NextResponse.json({ error: "Unable to load product." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = parsePayload(body);

    if (parsed.errors || !parsed.input) {
      return NextResponse.json({ errors: parsed.errors }, { status: 400 });
    }

    const result = await updateAdminProduct(id, parsed.input);

    if (Object.keys(result.collisions).length) {
      return NextResponse.json({ errors: result.collisions }, { status: 409 });
    }

    return NextResponse.json({ product: result.product });
  } catch (error) {
    logger.error("AdminProducts", "Failed to update product.", error);
    return NextResponse.json({ error: "Unable to update product." }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await context.params;
    await deleteAdminProduct(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("AdminProducts", "Failed to delete product.", error);
    return NextResponse.json({ error: "Unable to delete product." }, { status: 500 });
  }
}
