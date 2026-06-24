import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Boxes,
  Building2,
  FolderTree,
  MessageSquareText,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Tags,
  Users,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatCard } from "@/components/admin/stat-card";
import { getAdminProductTaxonomy } from "@/lib/admin-product-taxonomy";
import { listAdminBrands, listAdminProducts } from "@/lib/admin-products";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const numberFormat = new Intl.NumberFormat("en-US");
const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const managementLinks = [
  { href: "/admin/products", title: "Products", text: "Review and edit products in the new Supabase catalog.", icon: Boxes },
  { href: "/admin/categories", title: "Categories", text: "View categories and their subcategories from Supabase.", icon: FolderTree },
  { href: "/admin/categories/new", title: "Add Category", text: "Create a top-level category with the next Supabase id.", icon: Plus },
  { href: "/admin/subcategories/new", title: "Add Subcategory", text: "Create a subcategory under a selected Supabase category.", icon: Plus },
  { href: "/admin/brands", title: "Brands", text: "View brands from the Supabase brands table.", icon: Tags },
  { href: "/admin/brands/new", title: "Add Brand", text: "Create a featured brand record in Supabase.", icon: Plus },
  { href: "/admin/visitors", title: "Visitors", text: "Placeholder until Supabase visitor tracking is connected.", icon: Users },
  { href: "/admin/orders", title: "WhatsApp Orders", text: "Placeholder until Supabase order tracking is connected.", icon: MessageSquareText },
];

export async function AdminDashboard() {
  let products: Awaited<ReturnType<typeof listAdminProducts>>["products"] = [];
  let categories: Awaited<ReturnType<typeof listAdminProducts>>["categories"] = [];
  let brands: Awaited<ReturnType<typeof listAdminProducts>>["brands"] = [];
  let taxonomy: Awaited<ReturnType<typeof getAdminProductTaxonomy>> = [];
  let brandRows: Awaited<ReturnType<typeof listAdminBrands>> = [];
  let imageRowCount = 0;
  let linkRowCount = 0;
  let loadError: string | null = null;

  try {
    const supabase = getSupabaseAdminClient();
    const [productData, taxonomyData, brandData, imageCount, linkCount] = await Promise.all([
      listAdminProducts(),
      getAdminProductTaxonomy(),
      listAdminBrands(),
      supabase.from("product_images").select("*", { count: "exact", head: true }),
      supabase.from("product_subcategories").select("*", { count: "exact", head: true }),
    ]);

    products = productData.products;
    categories = productData.categories;
    brands = productData.brands;
    taxonomy = taxonomyData;
    brandRows = brandData;
    imageRowCount = imageCount.count || 0;
    linkRowCount = linkCount.count || 0;

    if (imageCount.error || linkCount.error) {
      loadError = imageCount.error?.message || linkCount.error?.message || "Unable to load dashboard counts.";
    }
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unable to load admin dashboard data.";
  }

  const subcategoryCount = taxonomy.reduce((total, category) => total + category.subcategories.length, 0);
  const activeProducts = products.filter((product) => product.status === "active").length;
  const draftProducts = products.filter((product) => product.status === "draft").length;
  const archivedProducts = products.filter((product) => product.status === "archived").length;
  const featuredBrands = brandRows.length;
  const recentProducts = products.slice(0, 8);

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-6">
        {loadError ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-amber-700">Admin data unavailable</p>
            <h2 className="mt-2 text-lg font-semibold">The dashboard loaded, but Supabase admin data could not be read.</h2>
            <p className="mt-2 text-sm leading-6">
              Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in Netlify, and that the Supabase tables exist.
            </p>
            <p className="mt-3 rounded-xl border border-amber-200 bg-white/70 p-3 text-sm font-medium">{loadError}</p>
          </section>
        ) : null}

        <section className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-sm">
          <div className="grid gap-6 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.22),transparent_36%),linear-gradient(135deg,#ffffff_0%,#eff6ff_55%,#f5f3ff_100%)] p-6 lg:grid-cols-[1fr_280px] lg:p-8">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold uppercase tracking-[0.12em] text-sky-700">
                  <Sparkles size={14} aria-hidden="true" />
                  Supabase Admin Overview
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                  New catalog management
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                  This console now reads admin catalog data only from the new Supabase schema.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <ActionButton href="/admin/products" primary icon={<Plus size={16} aria-hidden="true" />} label="Add Product" />
                <ActionButton href="/admin/categories/new" icon={<FolderTree size={16} aria-hidden="true" />} label="Add Category" />
                <ActionButton href="/admin/subcategories/new" icon={<FolderTree size={16} aria-hidden="true" />} label="Add Subcategory" />
                <ActionButton href="/admin/brands/new" icon={<Tags size={16} aria-hidden="true" />} label="Add Brand" />
                <ActionButton href="/admin/products" icon={<Boxes size={16} aria-hidden="true" />} label="View All Products" />
                <ActionButton href="/admin/visitors" icon={<Users size={16} aria-hidden="true" />} label="View Visitors" />
                <ActionButton href="/admin/orders" icon={<ShoppingCart size={16} aria-hidden="true" />} label="View WhatsApp Orders" />
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
          <StatCard label="Products" value={numberFormat.format(products.length)} description={`${activeProducts} active / ${draftProducts} draft / ${archivedProducts} archived`} icon={<PackageCheck size={18} aria-hidden="true" />} tone="sky" />
          <StatCard label="Categories" value={numberFormat.format(categories.length)} description={`${numberFormat.format(subcategoryCount)} subcategories`} icon={<FolderTree size={18} aria-hidden="true" />} tone="emerald" />
          <StatCard label="Brands" value={numberFormat.format(brands.length)} description={`${numberFormat.format(featuredBrands)} Supabase brand records`} icon={<Tags size={18} aria-hidden="true" />} tone="violet" />
          <StatCard label="Images" value={numberFormat.format(imageRowCount)} description="Rows in product_images" icon={<Building2 size={18} aria-hidden="true" />} tone="slate" />
          <StatCard label="Product Links" value={numberFormat.format(linkRowCount)} description="Rows in product_subcategories" icon={<Boxes size={18} aria-hidden="true" />} tone="amber" />
          <StatCard label="Visitors" value="Pending" description="Supabase tracking not connected yet" icon={<Users size={18} aria-hidden="true" />} tone="rose" />
          <StatCard label="WhatsApp Orders" value="Pending" description="Supabase orders not connected yet" icon={<MessageSquareText size={18} aria-hidden="true" />} tone="emerald" />
          <StatCard label="Catalog Source" value="Supabase" description="New schema only" icon={<Building2 size={18} aria-hidden="true" />} tone="sky" />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-zinc-950">Management</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {managementLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="group rounded-2xl border border-white/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md">
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

        <section className="rounded-2xl border border-white/80 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4">
            <h2 className="font-semibold text-zinc-950">Recent Supabase Products</h2>
            <Link href="/admin/products" className="text-sm font-semibold text-sky-700 hover:text-sky-800">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-sky-50 text-left text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Subcategories</th>
                  <th className="px-5 py-3">Brand</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recentProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-5 py-3 font-medium text-zinc-950">{product.title}</td>
                    <td className="px-5 py-3 text-zinc-600">{product.categoryName || "N/A"}</td>
                    <td className="px-5 py-3 text-zinc-600">{product.subcategoryNames.join(", ") || "N/A"}</td>
                    <td className="px-5 py-3 text-zinc-600">{product.brandName || "N/A"}</td>
                    <td className="px-5 py-3 text-zinc-600">{product.price === null ? "N/A" : `$${product.price.toFixed(2)}`}</td>
                    <td className="px-5 py-3 text-zinc-600">{product.updatedAt ? dateFormat.format(new Date(product.updatedAt)) : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!recentProducts.length ? <EmptyState label="No Supabase products found." /> : null}
        </section>
      </div>
    </AdminShell>
  );
}

function ActionButton({ href, icon, label, primary = false }: { href: string; icon: ReactNode; label: string; primary?: boolean }) {
  return (
    <Link href={href} className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm transition ${primary ? "bg-sky-600 text-white hover:bg-sky-700" : "border border-sky-200 bg-white text-sky-800 hover:border-sky-400"}`}>
      {icon}
      {label}
    </Link>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="p-6 text-center text-sm text-zinc-500">{label}</div>;
}
