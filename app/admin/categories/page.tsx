import { AdminShell } from "@/components/admin/admin-shell";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { serializeCategory } from "@/lib/admin-serializers";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({
    include: { parent: true },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
  const parentOptions = categories.filter((category) => !category.parentId);

  return (
    <AdminShell title="Category Management">
      <TaxonomyManager
        kind="categories"
        items={categories.map(serializeCategory)}
        parentOptions={parentOptions.map(serializeCategory)}
      />
    </AdminShell>
  );
}
