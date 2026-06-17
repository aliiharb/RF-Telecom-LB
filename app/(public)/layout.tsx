// RF Telecom LB - UX/UI pass
import { Suspense } from "react";
import type { ReactNode } from "react";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)] text-[var(--color-text-1)]">
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <FloatingWhatsApp />
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
    </div>
  );
}
