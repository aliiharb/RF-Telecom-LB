"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { trackClientEvent } from "@/lib/client-analytics";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    const params = new URLSearchParams(query);

    void trackClientEvent("/api/analytics/page-view", {
      path,
      title: document.title,
      referrer: document.referrer || undefined,
      utmSource: params.get("utm_source") || undefined,
      utmMedium: params.get("utm_medium") || undefined,
      utmCampaign: params.get("utm_campaign") || undefined,
    });
  }, [pathname, searchParams]);

  return null;
}

export function SearchTracker({ term, resultsCount }: { term?: string; resultsCount?: number }) {
  useEffect(() => {
    if (term) {
      void trackClientEvent("/api/analytics/search", { term, resultsCount });
    }
  }, [term, resultsCount]);

  return null;
}

export function ProductViewTracker({
  productId,
  productSlug,
  productName,
}: {
  productId: string;
  productSlug: string;
  productName: string;
}) {
  useEffect(() => {
    void trackClientEvent("/api/analytics/product-view", {
      productId,
      productSlug,
      productName,
    });
  }, [productId, productSlug, productName]);

  return null;
}
