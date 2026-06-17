import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { getProducts } from "@/lib/catalog";
import { productDataFromFormData } from "@/lib/product-form";
import { prisma } from "@/lib/prisma";
import { saveProductImages } from "@/lib/storage";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) {
    return auth.response;
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search")?.trim();
  const category = searchParams.get("category")?.trim();
  const categoryId = searchParams.get("category_id")?.trim() || searchParams.get("categoryId")?.trim();
  const collection = searchParams.get("collection")?.trim();
  const subcategoryId = searchParams.get("subcategory_id")?.trim() || searchParams.get("subcategoryId")?.trim();

  const products = await getProducts({
    search,
    categoryId: categoryId || undefined,
    subcategoryId: subcategoryId || undefined,
    categorySlug: category || undefined,
    collectionSlug: collection || undefined,
  });

  return NextResponse.json({ products, total: products.length });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) {
    return auth.response;
  }

  try {
    const formData = await request.formData();
    const data = productDataFromFormData(formData);
    const files = formData.getAll("images").filter((value): value is File => value instanceof File);
    const images = await saveProductImages(files, data.name);

    const product = await prisma.product.create({
      data: {
        ...data,
        images: images.length
          ? {
              create: images.map((image, index) => ({
                url: image.url,
                alt: image.alt,
                position: index,
              })),
            }
          : undefined,
      },
      include: { images: true },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    logger.error("AdminProducts", "Failed to create product.", error);
    return NextResponse.json({ error: "Unable to create product." }, { status: 500 });
  }
}
