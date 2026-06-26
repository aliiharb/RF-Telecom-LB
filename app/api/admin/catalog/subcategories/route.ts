import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { slugify } from "@/lib/site";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  const body = (await request.json()) as { categoryId?: number; name?: string; slug?: string };
  const categoryId = Number(body.categoryId);
  const name = body.name?.trim() || "";
  const slug = slugify(body.slug || name);
  if (!categoryId || !name || !slug) return NextResponse.json({ error: "Category and subcategory name are required." }, { status: 400 });
  const supabase = getSupabaseAdminClient();
  const { data: existingSlug } = await supabase.from("subcategories").select("id").eq("category_id", categoryId).ilike("slug", slug);
  if (existingSlug?.length) return NextResponse.json({ error: "Slug is already used in this category." }, { status: 409 });
  const { data: existing, error: listError } = await supabase.from("subcategories").select("id").eq("category_id", categoryId);
  if (listError) throw listError;
  const maxSuffix = (existing || []).reduce((max, row) => {
    const suffix = Number(String(row.id).split("_")[1]);
    return Number.isFinite(suffix) ? Math.max(max, suffix) : max;
  }, 0);
  const id = `${categoryId}_${maxSuffix + 1}`;
  const { data, error } = await supabase.from("subcategories").insert({ id, category_id: categoryId, name, slug }).select("*").single();
  if (error) return NextResponse.json({ error: "Unable to create subcategory." }, { status: 500 });
  return NextResponse.json({ subcategory: data }, { status: 201 });
}
