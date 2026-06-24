import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  return (
    <AdminShell title="WhatsApp Orders">
      <div className="rounded-2xl border border-white/80 bg-white/95 p-8 text-zinc-600 shadow-sm">
        WhatsApp orders will appear here once order tracking is connected.
      </div>
    </AdminShell>
  );
}
