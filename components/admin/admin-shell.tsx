import type { ReactNode } from "react";
import Link from "next/link";
import { BarChart3, Boxes, FolderTree, LayoutDashboard, MessageSquareText, Plus, Tags, Users } from "lucide-react";
import { LogoutButton } from "@/components/admin/logout-button";
import { SITE_NAME } from "@/lib/site";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/brands", label: "Brands", icon: Tags },
  { href: "/admin/visitors", label: "Visitors", icon: Users },
  { href: "/admin/orders", label: "WhatsApp Orders", icon: MessageSquareText },
  { href: "/admin/supabase-products", label: "Catalog Viewer", icon: BarChart3 },
];

export function AdminShell({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_45%,#f7f3ff_100%)]">
      <header className="border-b border-white/70 bg-white/85 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <Link href="/admin" className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-700">
              {SITE_NAME} Admin
            </Link>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-950">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/products/new"
              className="hidden h-10 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 sm:inline-flex"
            >
              <Plus size={16} aria-hidden="true" />
              Add Product
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <aside className="h-fit rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm backdrop-blur">
          <nav className="grid gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-sky-50 hover:text-sky-800"
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
