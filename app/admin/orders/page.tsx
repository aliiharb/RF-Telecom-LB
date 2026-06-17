import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { asNumber, formatMoney, labelFromEnum } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await prisma.whatsAppOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: { visitor: true },
    take: 200,
  });

  return (
    <AdminShell title="WhatsApp Order Tracking">
      <div className="grid gap-4">
        {orders.map((order) => {
          const items = Array.isArray(order.cartItems) ? order.cartItems : [];
          return (
            <article key={order.id} className="rounded border border-zinc-200 bg-white p-5">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-zinc-950">{order.customerName}</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    {order.phone} / {order.createdAt.toLocaleString()}
                  </p>
                </div>
                <span className="text-sm font-medium text-zinc-950">{labelFromEnum(order.status)}</span>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-zinc-600 md:grid-cols-2">
                <p>Address: {order.address}</p>
                <p>Delivery: {labelFromEnum(order.deliveryMethod)}</p>
                <p>Notes: {order.notes || "N/A"}</p>
                <p>Total: {formatMoney(asNumber(order.total), order.currency)}</p>
              </div>
              <div className="mt-4 rounded bg-zinc-50 p-4 text-sm">
                <p className="font-medium text-zinc-950">Products</p>
                <div className="mt-2 grid gap-2 text-zinc-600">
                  {items.map((item, index) => (
                    <p key={`${order.id}-${index}`}>
                      {index + 1}. {displayJsonValue(item, "name")} / Qty: {displayJsonValue(item, "quantity")} /{" "}
                      {displayJsonValue(item, "brand")}
                    </p>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
        {!orders.length ? (
          <div className="rounded border border-zinc-200 bg-white p-8 text-center text-zinc-500">
            No WhatsApp order redirects yet.
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}

function displayJsonValue(value: unknown, key: string) {
  if (value && typeof value === "object" && key in value) {
    const record = value as Record<string, unknown>;
    return String(record[key] ?? "N/A");
  }

  return "N/A";
}
