import { NextResponse } from "next/server";
import { POST } from "@/app/api/admin/catalog/brands/route";
import { requireAdminApi } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("brands").select("*").order("name", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ brands: data || [] });
}

export { POST };
