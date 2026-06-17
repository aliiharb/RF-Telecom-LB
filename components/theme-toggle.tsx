"use client";

import clsx from "clsx";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type Theme = "dark" | "light";
type ThemeValues = Record<string, string>;

const storageKey = "rftelecom-theme";
const listeners = new Set<() => void>();

const themeValues: Record<Theme, ThemeValues> = {
  dark: {
    "--color-bg": "#111827",
    "--color-surface": "#151e2c",
    "--color-surface-2": "#1d2939",
    "--color-border": "rgba(255, 255, 255, 0.11)",
    "--color-accent": "#4a9eff",
    "--color-accent-dim": "#2e7bd5",
    "--color-success": "#22c55e",
    "--color-warning": "#f59e0b",
    "--color-danger": "#f87171",
    "--color-text-1": "#f8fafc",
    "--color-text-2": "#b7c0ce",
    "--color-text-3": "#7f8a9b",
    "--color-header": "rgba(17, 24, 39, 0.88)",
    "--color-header-strong": "rgba(17, 24, 39, 0.96)",
    "--color-overlay": "rgba(17, 24, 39, 0.97)",
    "--color-hero-bg": "linear-gradient(135deg, #111827 0%, #151e2c 100%)",
    "--color-hero-overlay": "rgba(0, 0, 0, 0.42)",
    "--color-stock-overlay": "rgba(0, 0, 0, 0.52)",
    "--color-accent-soft": "rgba(74, 158, 255, 0.14)",
    "--shadow-header": "0 8px 28px rgba(0, 0, 0, 0.2)",
    "--shadow-menu": "0 20px 60px rgba(0, 0, 0, 0.36)",
    "--shadow-accent": "0 12px 32px rgba(74, 158, 255, 0.12)",
    "--background": "#111827",
    "--foreground": "#f8fafc",
  },
  light: {
    "--color-bg": "#f7f9fc",
    "--color-surface": "#ffffff",
    "--color-surface-2": "#eef3fa",
    "--color-border": "#dfe6ef",
    "--color-accent": "#0068d9",
    "--color-accent-dim": "#0052ad",
    "--color-success": "#15803d",
    "--color-warning": "#b45309",
    "--color-danger": "#dc2626",
    "--color-text-1": "#111827",
    "--color-text-2": "#667085",
    "--color-text-3": "#8a94a6",
    "--color-header": "rgba(255, 255, 255, 0.88)",
    "--color-header-strong": "rgba(255, 255, 255, 0.96)",
    "--color-overlay": "rgba(247, 249, 252, 0.97)",
    "--color-hero-bg": "linear-gradient(135deg, #f7f9fc 0%, #ffffff 100%)",
    "--color-hero-overlay": "rgba(4, 12, 24, 0.5)",
    "--color-stock-overlay": "rgba(17, 24, 39, 0.5)",
    "--color-accent-soft": "rgba(0, 104, 217, 0.1)",
    "--shadow-header": "0 8px 24px rgba(15, 23, 42, 0.08)",
    "--shadow-menu": "0 20px 60px rgba(15, 23, 42, 0.14)",
    "--shadow-accent": "0 12px 32px rgba(0, 104, 217, 0.14)",
    "--background": "#f7f9fc",
    "--foreground": "#111827",
  },
};

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  Object.entries(themeValues[theme]).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
}

function readTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored === "light" || stored === "dark" ? stored : "light";
  } catch {
    return "light";
  }
}

function getThemeSnapshot(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const currentTheme = document.documentElement.dataset.theme;
  return currentTheme === "light" || currentTheme === "dark" ? currentTheme : readTheme();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  function handleStorage(event: StorageEvent) {
    if (event.key !== storageKey) {
      return;
    }

    applyTheme(readTheme());
    listeners.forEach((storedListener) => storedListener());
  }

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function notifyThemeChange() {
  listeners.forEach((listener) => listener());
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, () => "light");

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);

    try {
      window.localStorage.setItem(storageKey, nextTheme);
    } catch {
      // The visual theme is already applied; persistence can fail in private contexts.
    }

    notifyThemeChange();
  }

  const label = theme === "dark" ? "Switch to light mode" : "Switch to night mode";
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={clsx(
        "flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)] transition-colors duration-150 hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
        className,
      )}
      aria-label={label}
      title={label}
    >
      <Icon size={19} aria-hidden="true" />
    </button>
  );
}
