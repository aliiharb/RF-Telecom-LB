import { redirect } from "next/navigation";
import { RadioTower } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { getAdminSession } from "@/lib/auth";
import { SITE_NAME } from "@/lib/site";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--color-bg)] px-4 py-12 text-[var(--color-text-1)]">
      <div className="w-full max-w-md">
        <div className="mb-6 grid justify-items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white shadow-[var(--shadow-accent)]">
            <RadioTower size={24} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-text-3)]">{SITE_NAME}</p>
            <h1 className="mt-2 text-3xl font-bold text-[var(--color-text-1)]">Admin Login</h1>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[var(--color-text-2)]">
            Sign in to manage products, categories, orders, and visitor analytics.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
