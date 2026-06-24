import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { slugify } from "@/lib/site";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  const body = (await request.json()) as { name?: string; slug?: string; description?: string; featured?: boolean };
  const name = body.name?.trim() || "";
  const slug = slugify(body.slug || name);
  if (!name || !slug) return NextResponse.json({ error: "Brand name is required." }, { status: 400 });
  const supabase = getSupabaseAdminClient();
  const { data: existing } = await supabase.from("brands").select("id").ilike("slug", slug);
  if (existing?.length) return NextResponse.json({ error: "Slug is already used." }, { status: 409 });
  const { data, error } = await supabase
    .from("brands")
    .insert({ name, slug, description: body.description?.trim() || null, featured: body.featured !== false })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ brand: data }, { status: 201 });
}
