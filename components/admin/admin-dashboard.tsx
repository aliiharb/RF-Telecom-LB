import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Building2,
  Eye,
  FolderTree,
  MessageSquareText,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Tags,
  Users,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatCard } from "@/components/admin/stat-card";
import { getBrands, getCategories, getProducts } from "@/lib/catalog";
import { asNumber, formatMoney, labelFromEnum } from "@/lib/format";
import { prisma } from "@/lib/prisma";

const numberFormat = new Intl.NumberFormat("en-US");
const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const managementLinks = [
  {
    href: "/admin/products",
    title: "Products",
    text: "Review active catalog items and taxonomy connections.",
    icon: Boxes,
  },
  {
    href: "/admin/categories",
    title: "Categories",
    text: "Manage category and subcategory records.",
    icon: FolderTree,
  },
  {
    href: "/admin/brands",
    title: "Brands",
    text: "Maintain brand names, ordering, and SEO fields.",
    icon: Tags,
  },
  {
    href: "/admin/visitors",
    title: "Visitors",
    text: "Inspect sessions, product views, and cart activity.",
    icon: Users,
  },
  {
    href: "/admin/orders",
    title: "WhatsApp Orders",
    text: "Track checkout redirects and customer order details.",
    icon: MessageSquareText,
  },
  {
    href: "/admin/supabase-products",
    title: "Catalog Viewer",
    text: "Open the original Supabase product browser.",
    icon: Building2,
  },
];

export async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    products,
    categories,
    brands,
    totalVisitors,
    todayVisitors,
    totalProductViews,
    totalOrders,
    recentVisitors,
    recentOrders,
    searches,
  ] = await Promise.all([
    getProducts(),
    getCategories(),
    getBrands(),
    prisma.visitor.count(),
    prisma.visitor.count({ where: { lastVisitAt: { gte: today } } }),
    prisma.productView.count(),
    prisma.whatsAppOrder.count(),
    prisma.visitor.findMany({
      orderBy: { lastVisitAt: "desc" },
      take: 5,
      include: {
        _count: { select: { pageViews: true, productViews: true, cartEvents: true, orders: true } },
      },
    }),
    prisma.whatsAppOrder.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.searchEvent.groupBy({
      by: ["term"],
      _count: { term: true },
      orderBy: { _count: { term: "desc" } },
      take: 5,
    }),
  ]);

  const subcategoryCount = categories.reduce((total, category) => total + (category.children?.length || 0), 0);
  const recentProducts = products.slice(0, 8);
  const publishedProducts = products.filter((product) => product.published).length;
  const stockedProducts = products.filter((product) => product.availability === "IN_STOCK").length;

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-6">
        <section className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-sm">
          <div className="grid gap-6 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.22),transparent_36%),linear-gradient(135deg,#ffffff_0%,#eff6ff_55%,#f5f3ff_100%)] p-6 lg:grid-cols-[1fr_280px] lg:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold uppercase tracking-[0.12em] text-sky-700">
                <Sparkles size={14} aria-hidden="true" />
                Live Admin Overview
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                Catalog, traffic, and WhatsApp activity
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                A cleaner workspace for Ali and Zahraa to manage RF Telecom products, orders, visitors,
                and product discovery.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/products/new"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
              >
                <Plus size={16} aria-hidden="true" />
                Add Product
              </Link>
              <Link
                href="/admin/products"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-sky-200 bg-white px-4 text-sm font-semibold text-sky-800 shadow-sm transition hover:border-sky-400"
              >
                <Boxes size={16} aria-hidden="true" />
                Products
              </Link>
              <Link
                href="/admin/orders"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 text-sm font-semibold text-violet-800 shadow-sm transition hover:border-violet-400"
              >
                <ShoppingCart size={16} aria-hidden="true" />
                Orders
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">Admins</p>
            <div className="mt-4 grid gap-3">
              {["Ali", "Zahraa"].map((admin, index) => (
                <div key={admin} className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white ${index === 0 ? "bg-sky-600" : "bg-violet-600"}`}>
                    {admin.slice(0, 1)}
                  </span>
                  <div>
                    <p className="font-semibold text-zinc-950">{admin}</p>
                    <p className="text-xs text-zinc-500">Admin access</p>
                  </div>
                  <ShieldCheck size={18} className="ml-auto text-emerald-600" aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Products"
            value={numberFormat.format(products.length)}
            description={`${numberFormat.format(publishedProducts)} published`}
            icon={<PackageCheck size={18} aria-hidden="true" />}
            tone="sky"
          />
          <StatCard
            label="Categories"
            value={numberFormat.format(categories.length)}
            description={`${numberFormat.format(subcategoryCount)} subcategories`}
            icon={<FolderTree size={18} aria-hidden="true" />}
            tone="emerald"
          />
          <StatCard
            label="Brands"
            value={numberFormat.format(brands.length)}
            description={`${numberFormat.format(stockedProducts)} products in stock`}
            icon={<Tags size={18} aria-hidden="true" />}
            tone="violet"
          />
          <StatCard
            label="Visitors Today"
            value={numberFormat.format(todayVisitors)}
            description={`${numberFormat.format(totalVisitors)} total visitors`}
            icon={<Users size={18} aria-hidden="true" />}
            tone="amber"
          />
          <StatCard
            label="Product Views"
            value={numberFormat.format(totalProductViews)}
            description="Tracked from storefront product pages"
            icon={<Eye size={18} aria-hidden="true" />}
            tone="rose"
          />
          <StatCard
            label="WhatsApp Orders"
            value={numberFormat.format(totalOrders)}
            description="Checkout redirects captured in admin"
            icon={<MessageSquareText size={18} aria-hidden="true" />}
            tone="emerald"
          />
          <StatCard
            label="Search Terms"
            value={numberFormat.format(searches.length)}
            description="Top terms shown below"
            icon={<Search size={18} aria-hidden="true" />}
            tone="sky"
          />
          <StatCard
            label="Catalog Source"
            value={products.length ? "Active" : "Empty"}
            description="Prisma or Supabase fallback"
            icon={<Building2 size={18} aria-hidden="true" />}
            tone="slate"
          />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-zinc-950">Management</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {managementLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-white/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-xl border border-sky-100 bg-sky-50 p-2.5 text-sky-700">
                      <Icon size={18} aria-hidden="true" />
                    </div>
                    <ArrowRight size={17} className="text-zinc-400 group-hover:text-sky-700" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-semibold text-zinc-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{item.text}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-2xl border border-white/80 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4">
              <h2 className="font-semibold text-zinc-950">Recent Products</h2>
              <Link href="/admin/products" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 text-sm">
                <thead className="bg-sky-50 text-left text-zinc-500">
                  <tr>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Subcategory</th>
                    <th className="px-5 py-3">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {recentProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-5 py-3 font-medium text-zinc-950">{product.name}</td>
                      <td className="px-5 py-3 text-zinc-600">{product.category?.name || "N/A"}</td>
                      <td className="px-5 py-3 text-zinc-600">{product.subcategory?.name || "N/A"}</td>
                      <td className="px-5 py-3 text-zinc-600">{formatMoney(product.price, product.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!recentProducts.length ? <EmptyState label="No products found." /> : null}
          </div>

          <div className="grid gap-6">
            <Panel title="Top Searches">
              {searches.length ? (
                searches.map((search) => (
                  <div key={search.term} className="flex items-center justify-between gap-4 py-2 text-sm">
                    <span className="font-medium text-zinc-800">{search.term}</span>
                    <span className="text-zinc-500">{numberFormat.format(search._count.term)}</span>
                  </div>
                ))
              ) : (
                <EmptyState label="No searches tracked yet." compact />
              )}
            </Panel>

            <Panel title="Recent Visitors">
              {recentVisitors.length ? (
                recentVisitors.map((visitor) => (
                  <Link
                    key={visitor.id}
                    href={`/admin/visitors/${visitor.id}`}
                    className="block rounded-md px-2 py-2 text-sm hover:bg-zinc-50"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium text-zinc-800">{visitor.sessionId.slice(0, 12)}...</span>
                      <span className="text-zinc-500">{dateFormat.format(visitor.lastVisitAt)}</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {visitor._count.pageViews} pages / {visitor._count.productViews} products /{" "}
                      {visitor._count.cartEvents} cart events
                    </p>
                  </Link>
                ))
              ) : (
                <EmptyState label="No visitors tracked yet." compact />
              )}
            </Panel>
          </div>
        </section>

        <section className="rounded-2xl border border-white/80 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4">
            <h2 className="font-semibold text-zinc-950">Recent WhatsApp Orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
              View all
            </Link>
          </div>
          <div className="divide-y divide-zinc-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="grid gap-3 px-5 py-4 text-sm md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <p className="font-semibold text-zinc-950">{order.customerName}</p>
                  <p className="mt-1 text-zinc-500">
                    {order.phone} / {dateFormat.format(order.createdAt)}
                  </p>
                </div>
                <span className="text-zinc-600">{labelFromEnum(order.deliveryMethod)}</span>
                <span className="font-semibold text-zinc-950">{formatMoney(asNumber(order.total), order.currency)}</span>
              </div>
            ))}
          </div>
          {!recentOrders.length ? <EmptyState label="No WhatsApp orders yet." /> : null}
        </section>
      </div>
    </AdminShell>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm">
      <h2 className="mb-2 font-semibold text-zinc-950">{title}</h2>
      <div className="divide-y divide-zinc-100">{children}</div>
    </div>
  );
}

function EmptyState({ label, compact = false }: { label: string; compact?: boolean }) {
  return <div className={`${compact ? "py-3" : "p-6"} text-center text-sm text-zinc-500`}>{label}</div>;
}
