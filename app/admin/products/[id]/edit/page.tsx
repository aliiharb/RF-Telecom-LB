import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EditProductPage() {
  await requireAdmin();

  return (
    <AdminShell title="Edit Product">
      <div className="rounded-md border border-zinc-200 bg-white p-6 text-sm leading-6 text-zinc-600 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Product editing is not available here</h2>
        <p className="mt-3">
          Adding new products is available from the admin area. Editing existing catalog products will
          be added after the product import and local product records are fully unified.
        </p>
        <Link href="/admin/products" className="mt-5 inline-flex font-medium text-blue-700 hover:text-blue-800">
          Back to products
        </Link>
      </div>
    </AdminShell>
  );
}
