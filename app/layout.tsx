// RF Telecom LB - UX/UI pass
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { CartProvider } from "@/components/cart-provider";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const themeInitScript = `
(function () {
  var themes = {
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
      "--foreground": "#f7f7f7"
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
      "--foreground": "#222222"
    }
  };

  function applyTheme(theme) {
    var root = document.documentElement;
    var values = themes[theme] || themes.dark;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    Object.keys(values).forEach(function (name) {
      root.style.setProperty(name, values[name]);
    });
  }

  try {
    var key = "rftelecom-theme";
    var stored = window.localStorage.getItem(key);
    var theme = stored === "light" || stored === "dark" ? stored : "light";
    applyTheme(theme);
  } catch (error) {
    applyTheme("light");
  }
})();
`;

export const metadata: Metadata = buildMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} h-full antialiased`}
      data-theme="light"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[var(--color-bg)] text-[var(--color-text-1)]">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <CartProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[var(--color-surface-2)] focus:px-4 focus:py-2 focus:text-[var(--color-text-1)]"
          >
            Skip to content
          </a>
          <JsonLd data={organizationJsonLd()} />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
