import { AdminShell } from "@/components/admin/admin-shell";
import { SimpleCatalogForm } from "@/components/admin/simple-catalog-form";
import { getAdminProductTaxonomy } from "@/lib/admin-product-taxonomy";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AddSubcategoryPage() {
  await requireAdmin();
  const categories = await getAdminProductTaxonomy();
  return (
    <AdminShell title="Add Subcategory">
      <SimpleCatalogForm kind="subcategory" categories={categories} />
    </AdminShell>
  );
}
