import { AdminShell } from "@/components/admin/admin-shell";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { serializeBrand } from "@/lib/admin-serializers";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  await requireAdmin();
  const brands = await prisma.brand.findMany({ orderBy: [{ displayOrder: "asc" }, { name: "asc" }] });

  return (
    <AdminShell title="Brand Management">
      <TaxonomyManager kind="brands" items={brands.map(serializeBrand)} />
    </AdminShell>
  );
}
