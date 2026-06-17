import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/site";

export const runtime = "nodejs";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;
  const body = await request.json();
  const name = String(body.name || "").trim();

  if (!name) {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name,
      slug: slugify(String(body.slug || name)),
      parentId: body.parentId || null,
      description: body.description || null,
      seoTitle: body.seoTitle || null,
      seoDescription: body.seoDescription || null,
      displayOrder: Number(body.displayOrder || 0),
    },
  });

  return NextResponse.json({ category });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;
  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
