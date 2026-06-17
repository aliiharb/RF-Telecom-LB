import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getProducts } from "@/lib/catalog";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await getProducts();

  return (
    <AdminShell title="Product Management">
      <div className="mb-5 flex flex-col justify-between gap-4 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-indigo-50 p-5 text-sm leading-6 text-sky-950 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h2 className="font-semibold text-sky-950">Catalog products</h2>
          <p className="mt-1">
            Review current products and add new catalog items with price, images, SKU, and stock state.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
        >
          <Plus size={17} aria-hidden="true" />
          Add Product
        </Link>
      </div>
      <div className="overflow-hidden rounded border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Subcategory</th>
                <th className="px-4 py-3">Collection Handle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 font-medium text-zinc-950">{product.name}</td>
                  <td className="px-4 py-3 text-zinc-600">{product.category?.name || "N/A"}</td>
                  <td className="px-4 py-3 text-zinc-600">{product.subcategory?.name || "N/A"}</td>
                  <td className="px-4 py-3 text-zinc-600">{product.collectionHandle || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {!products.length ? (
        <div className="mt-6 rounded border border-zinc-200 bg-white p-8 text-center text-zinc-600">
          No products found.
        </div>
      ) : null}
    </AdminShell>
  );
}
