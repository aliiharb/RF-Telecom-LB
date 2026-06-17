import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/site";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) {
    return auth.response;
  }

  const brands = await prisma.brand.findMany({ orderBy: [{ displayOrder: "asc" }, { name: "asc" }] });
  return NextResponse.json({ brands });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) {
    return auth.response;
  }

  const body = await request.json();
  const name = String(body.name || "").trim();

  if (!name) {
    return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
  }

  const brand = await prisma.brand.create({
    data: {
      name,
      slug: slugify(String(body.slug || name)),
      logoUrl: body.logoUrl || null,
      description: body.description || null,
      seoTitle: body.seoTitle || null,
      seoDescription: body.seoDescription || null,
      displayOrder: Number(body.displayOrder || 0),
    },
  });

  return NextResponse.json({ brand }, { status: 201 });
}
