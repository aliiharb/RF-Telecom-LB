import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminVisitorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  return (
    <AdminShell title="Visitor Detail">
      <section className="rounded-2xl border border-white/80 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-zinc-950">Visitor {id}</p>
        <p className="mt-2 text-sm text-zinc-600">
          Visitor tracking is not connected to the new Supabase schema yet.
        </p>
      </section>
    </AdminShell>
  );
}
