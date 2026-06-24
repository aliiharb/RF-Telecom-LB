import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { slugify } from "@/lib/site";

export const runtime = "nodejs";

function extensionFor(file: File) {
  const nameExtension = file.name.split(".").pop();
  if (nameExtension) return nameExtension.toLowerCase();
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const formData = await request.formData();
    const kind = String(formData.get("kind") || "");
    const files = formData.getAll("files").filter((value): value is File => value instanceof File);
    const productSlug = slugify(String(formData.get("slug") || "product")) || "product";

    if (!files.length) {
      return NextResponse.json({ error: "No files uploaded." }, { status: 400 });
    }

    if (kind === "pdf" && files.some((file) => file.type !== "application/pdf")) {
      return NextResponse.json({ error: "Spec sheet must be a PDF." }, { status: 400 });
    }

    if (kind === "images" && files.some((file) => !file.type.startsWith("image/"))) {
      return NextResponse.json({ error: "Images upload only accepts image files." }, { status: 400 });
    }

    const bucket = kind === "pdf" ? "product-pdfs" : "product-images";
    const supabase = getSupabaseAdminClient();
    const uploads = [];

    for (const [index, file] of files.entries()) {
      const path = `${productSlug}/${Date.now()}-${index}.${extensionFor(file)}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        contentType: file.type || undefined,
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      uploads.push({ url: data.publicUrl, name: file.name, type: file.type });
    }

    return NextResponse.json({ uploads });
  } catch (error) {
    logger.error("AdminUploads", "Failed to upload admin files.", error);
    return NextResponse.json({ error: "Unable to upload files." }, { status: 500 });
  }
}
