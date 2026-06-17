"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="inline-flex h-9 items-center gap-2 rounded border border-zinc-200 px-3 text-sm text-zinc-700 hover:border-zinc-950 hover:text-zinc-950"
    >
      <LogOut size={15} />
      Logout
    </button>
  );
}
