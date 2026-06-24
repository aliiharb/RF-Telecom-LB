import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { slugify } from "@/lib/site";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("categories").select("id,name,slug").order("id", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ categories: data || [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  const body = (await request.json()) as { name?: string; slug?: string };
  const name = body.name?.trim() || "";
  const slug = slugify(body.slug || name);
  if (!name || !slug) return NextResponse.json({ error: "Category name is required." }, { status: 400 });
  const supabase = getSupabaseAdminClient();
  const { data: existing } = await supabase.from("categories").select("id").ilike("slug", slug);
  if (existing?.length) return NextResponse.json({ error: "Slug is already used." }, { status: 409 });
  const { data: maxRows, error: maxError } = await supabase.from("categories").select("id").order("id", { ascending: false }).limit(1);
  if (maxError) throw maxError;
  const id = ((maxRows?.[0]?.id as number | undefined) || 0) + 1;
  const { data, error } = await supabase.from("categories").insert({ id, name, slug }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ category: data }, { status: 201 });
}
