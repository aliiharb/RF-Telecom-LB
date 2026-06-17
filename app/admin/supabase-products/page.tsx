import { SupabaseCatalogViewer } from "@/components/admin/supabase-catalog-viewer";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SupabaseProductsAdminPage() {
  await requireAdmin();
  return <SupabaseCatalogViewer />;
}
