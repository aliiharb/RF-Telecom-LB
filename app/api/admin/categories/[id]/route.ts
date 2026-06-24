import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { slugify } from "@/lib/site";

export const runtime = "nodejs";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const body = await request.json();
  const name = String(body.name || "").trim();
  const slug = slugify(String(body.slug || name));
  if (!name || !slug) return NextResponse.json({ error: "Category name is required." }, { status: 400 });
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("categories").update({ name, slug }).eq("id", Number(id)).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ category: data });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const supabase = getSupabaseAdminClient();
  const categoryId = Number(id);

  const { data: subcategories, error: subcategoryError } = await supabase
    .from("subcategories")
    .select("id")
    .eq("category_id", categoryId);
  if (subcategoryError) return NextResponse.json({ error: subcategoryError.message }, { status: 500 });

  const subcategoryIds = (subcategories || []).map((subcategory) => String(subcategory.id));

  if (subcategoryIds.length) {
    const { error: linkError } = await supabase
      .from("product_subcategories")
      .delete()
      .in("subcategory_id", subcategoryIds);
    if (linkError) return NextResponse.json({ error: linkError.message }, { status: 500 });

    const { error: deleteSubcategoriesError } = await supabase
      .from("subcategories")
      .delete()
      .eq("category_id", categoryId);
    if (deleteSubcategoriesError) return NextResponse.json({ error: deleteSubcategoriesError.message }, { status: 500 });
  }

  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
