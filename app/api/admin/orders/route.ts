import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) {
    return auth.response;
  }

  return NextResponse.json({
    orders: [],
    message: "WhatsApp order tracking will appear here once Supabase order capture is connected.",
  });
}
