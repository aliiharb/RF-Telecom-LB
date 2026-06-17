import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  description,
  icon,
  tone = "sky",
}: {
  label: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  tone?: "sky" | "emerald" | "violet" | "amber" | "rose" | "slate";
}) {
  const tones = {
    sky: "from-sky-50 to-cyan-50 text-sky-700 border-sky-100",
    emerald: "from-emerald-50 to-teal-50 text-emerald-700 border-emerald-100",
    violet: "from-violet-50 to-fuchsia-50 text-violet-700 border-violet-100",
    amber: "from-amber-50 to-orange-50 text-amber-700 border-amber-100",
    rose: "from-rose-50 to-pink-50 text-rose-700 border-rose-100",
    slate: "from-slate-50 to-zinc-50 text-slate-700 border-slate-200",
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-zinc-500">{label}</p>
        {icon ? (
          <div className={`rounded-xl border bg-gradient-to-br p-2.5 ${tones[tone]}`}>{icon}</div>
        ) : null}
      </div>
      <p className="mt-3 text-3xl font-semibold text-zinc-950">{value}</p>
      {description ? <p className="mt-2 text-sm text-zinc-500">{description}</p> : null}
    </div>
  );
}
