import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { slugify } from "@/lib/site";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "products");

function extensionFor(file: File) {
  const extension = path.extname(file.name || "");

  if (extension) {
    return extension.toLowerCase();
  }

  if (file.type === "image/png") {
    return ".png";
  }

  if (file.type === "image/webp") {
    return ".webp";
  }

  return ".jpg";
}

export async function saveProductImages(files: File[], productName: string) {
  await mkdir(UPLOAD_ROOT, { recursive: true });

  const safeName = slugify(productName || "product");
  const saved = [];

  for (const file of files) {
    if (!file.size || !file.type.startsWith("image/")) {
      continue;
    }

    const fileName = `${safeName}-${randomUUID()}${extensionFor(file)}`;
    const destination = path.join(UPLOAD_ROOT, fileName);
    const bytes = Buffer.from(await file.arrayBuffer());

    await writeFile(destination, bytes);
    saved.push({
      url: `/uploads/products/${fileName}`,
      alt: productName,
    });
  }

  return saved;
}
