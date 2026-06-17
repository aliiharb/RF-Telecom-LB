import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminVisitorsPage() {
  await requireAdmin();
  const visitors = await prisma.visitor.findMany({
    orderBy: { lastVisitAt: "desc" },
    take: 100,
    include: {
      _count: { select: { pageViews: true, productViews: true, cartEvents: true, orders: true } },
    },
  });

  return (
    <AdminShell title="Viewer Analytics">
      <div className="overflow-hidden rounded border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr>
                <th className="px-4 py-3">Visitor</th>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">Page views</th>
                <th className="px-4 py-3">Product views</th>
                <th className="px-4 py-3">Cart events</th>
                <th className="px-4 py-3">Last visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {visitors.map((visitor) => (
                <tr key={visitor.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/visitors/${visitor.id}`} className="font-medium text-zinc-950 hover:underline">
                      {visitor.sessionId.slice(0, 12)}...
                    </Link>
                    <p className="text-xs text-zinc-500">IP hash: {visitor.ipHash?.slice(0, 12) || "N/A"}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {visitor.deviceType || "N/A"} / {visitor.browser || "N/A"} / {visitor.operatingSystem || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{visitor._count.pageViews}</td>
                  <td className="px-4 py-3 text-zinc-600">{visitor._count.productViews}</td>
                  <td className="px-4 py-3 text-zinc-600">{visitor._count.cartEvents}</td>
                  <td className="px-4 py-3 text-zinc-600">{visitor.lastVisitAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
