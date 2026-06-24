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
  const { error } = await supabase.from("categories").delete().eq("id", Number(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
