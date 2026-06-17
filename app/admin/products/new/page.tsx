import { AdminShell } from "@/components/admin/admin-shell";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth";
import { getAllCategoriesFlat, getBrands } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();
  const [brands, categories] = await Promise.all([getBrands(), getAllCategoriesFlat()]);

  return (
    <AdminShell title="Add Product">
      <ProductForm brands={brands} categories={categories} />
    </AdminShell>
  );
}
