import { getAdminProductTaxonomy, getAdminSubcategoryMap, type AdminCategoryOption } from "@/lib/admin-product-taxonomy";
import { logger } from "@/lib/logger";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export type AdminProductStatus = "draft" | "active" | "archived";

export type AdminBrandOption = {
  id: number;
  name: string;
  slug: string;
};

export type AdminProductImage = {
  id: string;
  url: string;
  position: number;
  isPrimary: boolean;
};

export type AdminManagedProduct = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number | null;
  weight: number | null;
  color: string | null;
  sku: string | null;
  status: AdminProductStatus;
  brandId: number | null;
  brandName: string | null;
  specPdfUrl: string | null;
  images: AdminProductImage[];
  primaryImageUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  categoryId: number | null;
  categoryName: string | null;
  subcategoryIds: string[];
  subcategoryNames: string[];
};

export type AdminProductInput = {
  title: string;
  slug: string;
  description: string | null;
  price: number | null;
  weight: number | null;
  color: string | null;
  sku: string | null;
  status: AdminProductStatus;
  brandId: number | null;
  specPdfUrl: string | null;
  subcategoryIds: string[];
  images: Array<{ url: string; position: number; isPrimary: boolean }>;
};

type ProductRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number | string | null;
  weight: number | string | null;
  color: string | null;
  sku: string | null;
  status: string | null;
  brand_id: number | null;
  spec_pdf_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ProductImageRow = {
  id: string;
  product_id: string;
  url: string;
  position: number;
  is_primary: boolean;
};

const PRODUCT_COLUMNS = "id,title,slug,description,price,weight,color,sku,status,brand_id,spec_pdf_url,created_at,updated_at";

function normalizeStatus(status: string | null | undefined): AdminProductStatus {
  return status === "active" || status === "archived" || status === "draft" ? status : "draft";
}

function mapProduct(
  product: ProductRow,
  links: Array<{ product_id: string; subcategory_id: string }>,
  images: ProductImageRow[],
  brands: AdminBrandOption[],
  categories: AdminCategoryOption[],
): AdminManagedProduct {
  const subcategoryMap = getAdminSubcategoryMap(categories);
  const subcategoryIds = links
    .filter((link) => link.product_id === product.id)
    .map((link) => String(link.subcategory_id))
    .filter((id, index, ids) => ids.indexOf(id) === index)
    .sort();
  const subcategories = subcategoryIds.map((id) => subcategoryMap.get(id)).filter((item) => item !== undefined);
  const firstSubcategory = subcategories[0] || null;
  const category = firstSubcategory ? categories.find((item) => item.id === firstSubcategory.categoryId) || null : null;
  const productImages = images
    .filter((image) => image.product_id === product.id)
    .sort((a, b) => a.position - b.position)
    .map((image) => ({ id: image.id, url: image.url, position: image.position, isPrimary: image.is_primary }));
  const brand = product.brand_id ? brands.find((item) => item.id === product.brand_id) || null : null;
  const primaryImage = productImages.find((image) => image.isPrimary) || productImages[0] || null;

  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    price: product.price === null || product.price === undefined ? null : Number(product.price),
    weight: product.weight === null || product.weight === undefined ? null : Number(product.weight),
    color: product.color,
    sku: product.sku,
    status: normalizeStatus(product.status),
    brandId: product.brand_id,
    brandName: brand?.name || null,
    specPdfUrl: product.spec_pdf_url,
    images: productImages,
    primaryImageUrl: primaryImage?.url || null,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
    categoryId: category?.id || null,
    categoryName: category?.name || null,
    subcategoryIds,
    subcategoryNames: subcategories.map((subcategory) => subcategory.name),
  };
}

export async function listAdminBrands() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("brands").select("id,name,slug").order("name", { ascending: true });
  if (error) throw error;
  return (data || []) as AdminBrandOption[];
}

export async function listAdminProducts(search?: string, categoryId?: number, brandId?: number, status?: string) {
  const supabase = getSupabaseAdminClient();
  const [categories, brands] = await Promise.all([getAdminProductTaxonomy(), listAdminBrands()]);
  const allowedSubcategoryIds = categoryId
    ? categories.find((category) => category.id === categoryId)?.subcategories.map((subcategory) => subcategory.id) || []
    : [];
  let query = supabase.from("products").select(PRODUCT_COLUMNS).order("updated_at", { ascending: false });
  if (search) query = query.ilike("title", `%${search}%`);
  if (brandId) query = query.eq("brand_id", brandId);
  if (status) query = query.eq("status", status);
  const { data: products, error } = await query;
  if (error) {
    logger.error("AdminProducts", "Failed to list products.", error);
    throw new Error("Unable to load products.");
  }
  if (!products?.length) return { products: [], categories, brands };
  const productIds = products.map((product) => product.id);
  const [{ data: links, error: linksError }, { data: images, error: imagesError }] = await Promise.all([
    supabase.from("product_subcategories").select("product_id,subcategory_id").in("product_id", productIds),
    supabase.from("product_images").select("id,product_id,url,position,is_primary").in("product_id", productIds),
  ]);
  if (linksError) throw linksError;
  if (imagesError) throw imagesError;
  let mapped = (products as ProductRow[]).map((product) =>
    mapProduct(
      product,
      (links || []) as Array<{ product_id: string; subcategory_id: string }>,
      (images || []) as ProductImageRow[],
      brands,
      categories,
    ),
  );
  if (categoryId) mapped = mapped.filter((product) => product.subcategoryIds.some((id) => allowedSubcategoryIds.includes(id)));
  return { products: mapped, categories, brands };
}

export async function getAdminProduct(id: string) {
  const supabase = getSupabaseAdminClient();
  const [categories, brands] = await Promise.all([getAdminProductTaxonomy(), listAdminBrands()]);
  const { data: product, error } = await supabase.from("products").select(PRODUCT_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!product) return null;
  const [{ data: links, error: linksError }, { data: images, error: imagesError }] = await Promise.all([
    supabase.from("product_subcategories").select("product_id,subcategory_id").eq("product_id", id),
    supabase.from("product_images").select("id,product_id,url,position,is_primary").eq("product_id", id),
  ]);
  if (linksError) throw linksError;
  if (imagesError) throw imagesError;
  return mapProduct(
    product as ProductRow,
    (links || []) as Array<{ product_id: string; subcategory_id: string }>,
    (images || []) as ProductImageRow[],
    brands,
    categories,
  );
}

export async function checkProductUniqueFields(slug: string, sku: string | null, excludeId?: string) {
  const supabase = getSupabaseAdminClient();
  const collisions: Record<string, string> = {};
  let slugQuery = supabase.from("products").select("id").ilike("slug", slug);
  if (excludeId) slugQuery = slugQuery.neq("id", excludeId);
  const { data: slugMatches, error: slugError } = await slugQuery;
  if (slugError) throw slugError;
  if (slugMatches?.length) collisions.slug = "Slug is already used by another product.";
  if (sku) {
    let skuQuery = supabase.from("products").select("id").ilike("sku", sku);
    if (excludeId) skuQuery = skuQuery.neq("id", excludeId);
    const { data: skuMatches, error: skuError } = await skuQuery;
    if (skuError) throw skuError;
    if (skuMatches?.length) collisions.sku = "SKU is already used by another product.";
  }
  return collisions;
}

function productPayload(input: AdminProductInput) {
  return {
    title: input.title,
    slug: input.slug,
    description: input.description,
    price: input.price === null ? null : input.price.toFixed(2),
    weight: input.weight,
    color: input.color,
    sku: input.sku,
    status: input.status,
    brand_id: input.brandId,
    spec_pdf_url: input.specPdfUrl,
  };
}

async function replaceImages(productId: string, images: AdminProductInput["images"]) {
  const supabase = getSupabaseAdminClient();
  await supabase.from("product_images").delete().eq("product_id", productId);
  if (!images.length) return;
  const { error } = await supabase.from("product_images").insert(
    images.map((image, index) => ({
      product_id: productId,
      url: image.url,
      position: index,
      is_primary: image.isPrimary,
    })),
  );
  if (error) throw error;
}

export async function createAdminProduct(input: AdminProductInput) {
  const supabase = getSupabaseAdminClient();
  const collisions = await checkProductUniqueFields(input.slug, input.sku);
  if (Object.keys(collisions).length) return { product: null, collisions };
  const { data: product, error } = await supabase.from("products").insert(productPayload(input)).select(PRODUCT_COLUMNS).single();
  if (error || !product) throw error || new Error("Unable to create product.");
  const links = input.subcategoryIds.map((subcategoryId) => ({ product_id: product.id, subcategory_id: subcategoryId }));
  const { error: linkError } = links.length ? await supabase.from("product_subcategories").insert(links) : { error: null };
  if (linkError) {
    await supabase.from("products").delete().eq("id", product.id);
    throw linkError;
  }
  try {
    await replaceImages(product.id, input.images);
  } catch (error) {
    await supabase.from("products").delete().eq("id", product.id);
    throw error;
  }
  return { product: await getAdminProduct(product.id), collisions: {} };
}

export async function updateAdminProduct(id: string, input: AdminProductInput) {
  const supabase = getSupabaseAdminClient();
  const collisions = await checkProductUniqueFields(input.slug, input.sku, id);
  if (Object.keys(collisions).length) return { product: null, collisions };
  const { error } = await supabase.from("products").update(productPayload(input)).eq("id", id);
  if (error) throw error;
  const { data: existingLinks, error: linksError } = await supabase.from("product_subcategories").select("subcategory_id").eq("product_id", id);
  if (linksError) throw linksError;
  const existing = new Set((existingLinks || []).map((link) => String(link.subcategory_id)));
  const selected = new Set(input.subcategoryIds);
  const toDelete = [...existing].filter((subcategoryId) => !selected.has(subcategoryId));
  const toInsert = [...selected].filter((subcategoryId) => !existing.has(subcategoryId));
  if (toDelete.length) await supabase.from("product_subcategories").delete().eq("product_id", id).in("subcategory_id", toDelete);
  if (toInsert.length) await supabase.from("product_subcategories").insert(toInsert.map((subcategoryId) => ({ product_id: id, subcategory_id: subcategoryId })));
  await replaceImages(id, input.images);
  return { product: await getAdminProduct(id), collisions: {} };
}

export async function deleteAdminProduct(id: string) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}
