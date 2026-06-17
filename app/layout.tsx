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
      "--foreground": "#f8fafc"
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
      "--foreground": "#111827"
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
