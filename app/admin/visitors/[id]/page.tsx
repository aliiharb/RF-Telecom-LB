import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminVisitorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const visitor = await prisma.visitor.findUnique({
    where: { id },
    include: {
      pageViews: { orderBy: { createdAt: "desc" }, take: 100 },
      productViews: { orderBy: { createdAt: "desc" }, take: 100, include: { product: true } },
      searchEvents: { orderBy: { createdAt: "desc" }, take: 100 },
      cartEvents: { orderBy: { createdAt: "desc" }, take: 100, include: { product: true } },
      orders: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  if (!visitor) {
    notFound();
  }

  return (
    <AdminShell title="Visitor Detail">
      <div className="grid gap-6">
        <section className="rounded border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold text-zinc-950">Visitor</h2>
          <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
            <Detail label="Session ID" value={visitor.sessionId} />
            <Detail label="IP hash" value={visitor.ipHash || "N/A"} />
            <Detail label="Browser" value={visitor.browser || "N/A"} />
            <Detail label="Device" value={visitor.deviceType || "N/A"} />
            <Detail label="OS" value={visitor.operatingSystem || "N/A"} />
            <Detail label="Referrer" value={visitor.referrer || "N/A"} />
            <Detail label="UTM source" value={visitor.utmSource || "N/A"} />
            <Detail label="UTM campaign" value={visitor.utmCampaign || "N/A"} />
          </dl>
        </section>
        <Timeline title="Visited pages" items={visitor.pageViews.map((view) => `${view.path} / ${view.createdAt.toLocaleString()}`)} />
        <Timeline
          title="Product views"
          items={visitor.productViews.map(
            (view) => `${view.product?.name || view.productName || "Unknown product"} / ${view.createdAt.toLocaleString()}`,
          )}
        />
        <Timeline
          title="Searches"
          items={visitor.searchEvents.map((event) => `${event.term} / ${event.createdAt.toLocaleString()}`)}
        />
        <Timeline
          title="Cart events"
          items={visitor.cartEvents.map(
            (event) => `${event.eventType} / ${event.product?.name || event.productName || "N/A"} / ${event.createdAt.toLocaleString()}`,
          )}
        />
      </div>
    </AdminShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-zinc-500">{label}</dt>
      <dd className="mt-1 break-words text-zinc-950">{value}</dd>
    </div>
  );
}

function Timeline({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded border border-zinc-200 bg-white p-5">
      <h2 className="font-semibold text-zinc-950">{title}</h2>
      <div className="mt-4 grid gap-2 text-sm text-zinc-600">
        {items.length ? items.map((item) => <p key={item}>{item}</p>) : <p>No data yet.</p>}
      </div>
    </section>
  );
}
