import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
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
        <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-sky-50 text-left text-zinc-500">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Subcategories</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-5 py-3 text-zinc-500">{category.id}</td>
                    <td className="px-5 py-3 font-semibold text-zinc-950">{category.name}</td>
                    <td className="px-5 py-3 text-zinc-600">{category.slug}</td>
                    <td className="px-5 py-3 text-zinc-600">
                      {category.subcategories.map((subcategory) => subcategory.name).join(", ") || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
