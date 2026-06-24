import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

type BrandRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  featured: boolean | null;
};

export default async function AdminBrandsPage() {
  await requireAdmin();
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from("brands").select("id,name,slug,description,featured").order("name", { ascending: true });
  const brands = (data || []) as BrandRow[];

  return (
    <AdminShell title="Brand Management">
      <div className="grid gap-5">
        <Link href="/admin/brands/new" className="inline-flex h-11 w-fit items-center rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white hover:bg-sky-700">
          Add Brand
        </Link>
        <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-sky-50 text-left text-zinc-500">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Brand</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Featured</th>
                  <th className="px-5 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {brands.map((brand) => (
                  <tr key={brand.id}>
                    <td className="px-5 py-3 text-zinc-500">{brand.id}</td>
                    <td className="px-5 py-3 font-semibold text-zinc-950">{brand.name}</td>
                    <td className="px-5 py-3 text-zinc-600">{brand.slug}</td>
                    <td className="px-5 py-3 text-zinc-600">{brand.featured ? "Yes" : "No"}</td>
                    <td className="px-5 py-3 text-zinc-600">{brand.description || "N/A"}</td>
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
