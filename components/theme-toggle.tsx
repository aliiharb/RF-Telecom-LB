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
    "--color-bg": "#121212",
    "--color-surface": "#1f1f1f",
    "--color-surface-2": "#2b2b2b",
    "--color-border": "rgba(255, 255, 255, 0.16)",
    "--color-accent": "#ff385c",
    "--color-accent-dim": "#e61e4d",
    "--color-accent-active": "#d70466",
    "--color-secondary-accent": "#00a699",
    "--color-success": "#22c55e",
    "--color-warning": "#f59e0b",
    "--color-danger": "#ff8a73",
    "--color-text-1": "#f7f7f7",
    "--color-text-2": "#c7c7c7",
    "--color-text-3": "#9b9b9b",
    "--color-header": "rgba(18, 18, 18, 0.9)",
    "--color-header-strong": "rgba(18, 18, 18, 0.96)",
    "--color-overlay": "rgba(18, 18, 18, 0.92)",
    "--color-hero-bg": "#121212",
    "--color-hero-overlay": "rgba(0, 0, 0, 0.42)",
    "--color-stock-overlay": "rgba(0, 0, 0, 0.52)",
    "--color-accent-soft": "rgba(255, 56, 92, 0.16)",
    "--shadow-rest": "0 1px 2px rgba(0, 0, 0, 0.32)",
    "--shadow-header": "0 1px 2px rgba(0, 0, 0, 0.32)",
    "--shadow-menu": "0 8px 28px rgba(0, 0, 0, 0.42)",
    "--shadow-floating": "0 8px 28px rgba(0, 0, 0, 0.42)",
    "--shadow-accent": "0 6px 16px rgba(0, 0, 0, 0.34)",
    "--background": "#121212",
    "--foreground": "#f7f7f7",
  },
  light: {
    "--color-bg": "#ffffff",
    "--color-surface": "#ffffff",
    "--color-surface-2": "#f7f7f7",
    "--color-border": "#dddddd",
    "--color-accent": "#ff385c",
    "--color-accent-dim": "#e61e4d",
    "--color-accent-active": "#d70466",
    "--color-secondary-accent": "#00a699",
    "--color-success": "#15803d",
    "--color-warning": "#b45309",
    "--color-danger": "#c13515",
    "--color-text-1": "#222222",
    "--color-text-2": "#717171",
    "--color-text-3": "#9b9b9b",
    "--color-header": "rgba(255, 255, 255, 0.94)",
    "--color-header-strong": "rgba(255, 255, 255, 0.96)",
    "--color-overlay": "rgba(255, 255, 255, 0.92)",
    "--color-hero-bg": "#ffffff",
    "--color-hero-overlay": "rgba(4, 12, 24, 0.5)",
    "--color-stock-overlay": "rgba(17, 24, 39, 0.5)",
    "--color-accent-soft": "rgba(255, 56, 92, 0.1)",
    "--shadow-rest": "0 1px 2px rgba(0, 0, 0, 0.08)",
    "--shadow-header": "0 1px 2px rgba(0, 0, 0, 0.08)",
    "--shadow-menu": "0 8px 28px rgba(0, 0, 0, 0.15)",
    "--shadow-floating": "0 8px 28px rgba(0, 0, 0, 0.15)",
    "--shadow-accent": "0 6px 16px rgba(0, 0, 0, 0.12)",
    "--background": "#ffffff",
    "--foreground": "#222222",
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
        "flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-1)] shadow-[var(--shadow-rest)] transition-shadow duration-150 hover:shadow-[var(--shadow-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
        className,
      )}
      aria-label={label}
      title={label}
    >
      <Icon size={19} aria-hidden="true" />
    </button>
  );
}
