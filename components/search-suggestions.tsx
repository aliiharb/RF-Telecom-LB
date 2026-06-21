"use client";

import type { LucideIcon } from "lucide-react";

export type SearchSuggestion = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  tone: "blue" | "green" | "orange" | "rose" | "gray";
};

const toneClasses: Record<SearchSuggestion["tone"], string> = {
  blue: "bg-[#EAF3FF] text-[#005FCC]",
  green: "bg-[#EAF8F6] text-[#008A80]",
  orange: "bg-[#FFF2E4] text-[#C75B12]",
  rose: "bg-[#FFE8EF] text-[#D70466]",
  gray: "bg-[#F7F7F7] text-[#717171]",
};

export function SearchSuggestions({
  items,
  onSelect,
}: {
  items: SearchSuggestion[];
  onSelect: (title: string) => void;
}) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="animate-[dropdownIn_150ms_ease-out] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-floating)]">
      <p className="px-4 pb-2 pt-3 text-[13px] font-medium text-[var(--color-text-2)]">
        Suggested searches
      </p>
      <div className="max-h-[420px] overflow-y-auto pr-1 [scrollbar-color:#DDDDDD_transparent] [scrollbar-width:thin]">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              type="button"
              onClick={() => onSelect(item.title)}
              className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left transition-colors duration-150 hover:bg-[var(--color-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${toneClasses[item.tone]}`}
                aria-hidden="true"
              >
                <Icon size={22} strokeWidth={1.8} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-semibold leading-5 text-[var(--color-text-1)]">
                  {item.title}
                </span>
                <span className="mt-0.5 block truncate text-[13px] leading-5 text-[var(--color-text-2)]">
                  {item.subtitle}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
