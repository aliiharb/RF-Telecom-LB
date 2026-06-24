import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export type AdminSubcategoryOption = {
  id: string;
  name: string;
  slug: string;
  categoryId: number;
};

export type AdminCategoryOption = {
  id: number;
  name: string;
  slug: string;
  subcategories: AdminSubcategoryOption[];
};

type CategoryRow = { id: number; name: string; slug: string };
type SubcategoryRow = { id: string; name: string; slug: string; category_id: number };

export function getAdminSubcategoryMap(categories: AdminCategoryOption[]) {
  return new Map(categories.flatMap((category) => category.subcategories.map((subcategory) => [subcategory.id, subcategory])));
}

export async function getAdminProductTaxonomy() {
  const supabase = getSupabaseAdminClient();
  const [{ data: categoryRows, error: categoryError }, { data: subcategoryRows, error: subcategoryError }] =
    await Promise.all([
      supabase.from("categories").select("id,name,slug").order("id", { ascending: true }),
      supabase.from("subcategories").select("id,name,slug,category_id").order("category_id", { ascending: true }).order("id", { ascending: true }),
    ]);

  if (categoryError) {
    throw categoryError;
  }
  if (subcategoryError) {
    throw subcategoryError;
  }

  const subcategories = (subcategoryRows || []) as SubcategoryRow[];
  return ((categoryRows || []) as CategoryRow[]).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    subcategories: subcategories
      .filter((subcategory) => subcategory.category_id === category.id)
      .map((subcategory) => ({
        id: subcategory.id,
        name: subcategory.name,
        slug: subcategory.slug,
        categoryId: subcategory.category_id,
      })),
  }));
}
