import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const { id } = await context.params;
  const supabase = getSupabaseAdminClient();

  const { error: linkError } = await supabase.from("product_subcategories").delete().eq("subcategory_id", id);
  if (linkError) return NextResponse.json({ error: linkError.message }, { status: 500 });

  const { error } = await supabase.from("subcategories").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
