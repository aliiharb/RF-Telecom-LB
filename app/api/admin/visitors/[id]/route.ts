import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;
  return NextResponse.json(
    {
      error: "Visitor tracking is not connected to Supabase yet.",
      visitor: null,
      id,
    },
    { status: 404 },
  );
}
