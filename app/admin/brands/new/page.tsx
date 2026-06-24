import { AdminShell } from "@/components/admin/admin-shell";
import { SimpleCatalogForm } from "@/components/admin/simple-catalog-form";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AddBrandPage() {
  await requireAdmin();
  return (
    <AdminShell title="Add Brand">
      <SimpleCatalogForm kind="brand" />
    </AdminShell>
  );
}
