import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminVisitorsPage() {
  await requireAdmin();
  return (
    <AdminShell title="Visitor Analytics">
      <div className="rounded-2xl border border-white/80 bg-white/95 p-8 text-zinc-600 shadow-sm">
        Visitor analytics will appear here once tracking is connected.
      </div>
    </AdminShell>
  );
}
