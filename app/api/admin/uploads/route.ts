import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { slugify } from "@/lib/site";

export const runtime = "nodejs";

const MAX_UPLOAD_FILES = 10;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PDF_BYTES = 20 * 1024 * 1024;

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function extensionFor(file: File) {
  if (file.type === "application/pdf") return "pdf";
  return IMAGE_EXTENSIONS[file.type] || "jpg";
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

    if (files.length > MAX_UPLOAD_FILES) {
      return NextResponse.json({ error: `Upload up to ${MAX_UPLOAD_FILES} files at a time.` }, { status: 400 });
    }

    if (kind === "pdf" && files.some((file) => file.type !== "application/pdf")) {
      return NextResponse.json({ error: "Spec sheet must be a PDF." }, { status: 400 });
    }

    if (kind === "images" && files.some((file) => !(file.type in IMAGE_EXTENSIONS))) {
      return NextResponse.json({ error: "Images upload only accepts JPG, PNG, or WebP files." }, { status: 400 });
    }

    if (kind !== "pdf" && kind !== "images") {
      return NextResponse.json({ error: "Invalid upload type." }, { status: 400 });
    }

    const maxBytes = kind === "pdf" ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
    if (files.some((file) => file.size > maxBytes)) {
      return NextResponse.json({ error: "One or more files exceed the upload size limit." }, { status: 400 });
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
