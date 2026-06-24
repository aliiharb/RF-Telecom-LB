import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { CategoryManager } from "@/components/admin/category-manager";
import { getAdminProductTaxonomy } from "@/lib/admin-product-taxonomy";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await getAdminProductTaxonomy();

  return (
    <AdminShell title="Category Management">
      <div className="grid gap-5">
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/categories/new" className="inline-flex h-11 items-center rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white hover:bg-sky-700">
            Add Category
          </Link>
          <Link href="/admin/subcategories/new" className="inline-flex h-11 items-center rounded-xl border border-sky-200 bg-white px-4 text-sm font-semibold text-sky-800 hover:border-sky-400">
            Add Subcategory
          </Link>
        </div>
        <CategoryManager initialCategories={categories} />
      </div>
    </AdminShell>
  );
}
