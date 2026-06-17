import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/env";
import { CONTACT, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

type SeoInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  keywords?: string;
};

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) {
    return path;
  }

  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  image,
  keywords,
}: SeoInput = {}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Telecom Equipment Lebanon`;
  const canonical = absoluteUrl(path);

  return {
    title: fullTitle,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      images: image ? [{ url: absoluteUrl(image), alt: title || SITE_NAME }] : undefined,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: image ? [absoluteUrl(image)] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.address,
      addressCountry: CONTACT.country,
    },
    telephone: CONTACT.phones,
    email: CONTACT.email,
    sameAs: [CONTACT.facebook],
    url: getSiteUrl(),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: getSiteUrl(),
    email: CONTACT.email,
    telephone: CONTACT.phones,
    sameAs: [CONTACT.facebook],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: getSiteUrl(),
    potentialAction: {
      "@type": "SearchAction",
      target: `${getSiteUrl()}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}
