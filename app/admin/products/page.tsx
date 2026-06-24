import { AdminShell } from "@/components/admin/admin-shell";
import { ProductManager } from "@/components/admin/product-manager";
import { listAdminProducts } from "@/lib/admin-products";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();
  const { products, categories, brands } = await listAdminProducts();

  return (
    <AdminShell title="Product Management">
      <ProductManager initialProducts={products} categories={categories} brands={brands} />
    </AdminShell>
  );
}
