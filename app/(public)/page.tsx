// RF Telecom LB - professional storefront redesign
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Cable,
  Cpu,
  MessageCircle,
  Network,
  Phone,
  Plug,
  RadioTower,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { HeroPhotoSwitcher } from "@/components/hero-photo-switcher";
import { JsonLd } from "@/components/json-ld";
import { getBrands, getCategories } from "@/lib/catalog";
import { buildMetadata, localBusinessJsonLd, websiteJsonLd } from "@/lib/seo";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  path: "/",
  title: "Professional Telecom Equipment in Lebanon",
  description:
    "Shop professional telecom equipment, networking gear, security systems, and electrical equipment in Lebanon. RF Telecom LB offers Grandstream, Panasonic, TP-Link, Yealink and more.",
});

const categoryIcons = [Network, ShieldCheck, Cable, Plug, Zap, Cpu, RadioTower, Phone];

const heroPhotos = [
  {
    src: "/images/hero-networking-carousel.png",
    alt: "Networking switches, fiber tools, patch cables, and connectors arranged like a real telecom store display",
  },
  {
    src: "/images/hero-panasonic-pbx.jpg",
    alt: "Panasonic business phone and PBX equipment displayed as a telecom brand product banner",
    fit: "contain" as const,
  },
  {
    src: "/images/hero-avaya-office-phone.jpg",
    alt: "Avaya office phones on a real workplace desk showing business telecom products",
  },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function HomePage() {
  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);

  const categorySpotlight = categories.slice(0, 6);
  const featuredBrands = brands.slice(0, 8);

  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />
      <JsonLd data={websiteJsonLd()} />

      <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,var(--color-surface-2),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <HeroPhotoSwitcher photos={heroPhotos} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black leading-tight text-[var(--color-text-1)] sm:text-4xl">Shop by system type</h2>
          <p className="mt-3 text-base leading-7 text-[var(--color-text-2)]">
            Move from broad category to exact part number without losing installation context.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categorySpotlight.map((category, index) => {
            const Icon = categoryIcons[index % categoryIcons.length];
            const collections = category.children?.slice(0, 3) || [];

            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group grid min-h-64 content-between rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm transition hover:-translate-y-1 hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-accent)]"
              >
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                      <Icon size={23} aria-hidden="true" />
                    </span>
                    <ArrowRight
                      size={18}
                      className="text-[var(--color-text-3)] transition group-hover:translate-x-1 group-hover:text-[var(--color-accent)]"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-xl font-black text-[var(--color-text-1)]">{category.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--color-text-2)]">
                    {category.description || `${category.name} equipment, accessories, and matching parts.`}
                  </p>
                </div>
                {collections.length ? (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {collections.map((collection) => (
                      <span
                        key={collection.slug}
                        className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs font-semibold text-[var(--color-text-2)]"
                      >
                        {collection.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="mt-6 text-sm font-bold text-[var(--color-accent)]">Browse products</span>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {featuredBrands.length ? (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black leading-tight text-[var(--color-text-1)] sm:text-4xl">Brands in the supply chain.</h2>
            <p className="mt-3 text-base leading-7 text-[var(--color-text-2)]">
              Browse manufacturers carried through the RF Telecom catalog and request alternatives when the job needs a match.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {featuredBrands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="group grid min-h-28 place-items-center rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-[var(--color-accent)]"
                aria-label={`Browse ${brand.name} products`}
              >
                <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[var(--color-accent-soft)] text-sm font-black text-[var(--color-accent)] transition group-hover:bg-[var(--color-accent)] group-hover:text-white">
                  {initials(brand.name)}
                </span>
                <span className="mt-3 line-clamp-2 text-xs font-bold leading-4 text-[var(--color-text-1)]">{brand.name}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-1)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.7fr] lg:px-8">
          <div>
            <h2 className="max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
              Need a compatible part, a site bundle, or a replacement unit?
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--color-text-2)]">
              Send the requirement, quantity, and installation context. RF Telecom will help match the equipment and prepare the order.
            </p>
          </div>
          <div className="grid content-center gap-3">
            <a
              href={buildWhatsAppUrl("Hi RF Telecom LB, I want help preparing a telecom equipment order.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-accent-dim)]"
            >
              <MessageCircle size={17} aria-hidden="true" />
              Send requirements
            </a>
            <Link
              href="/contact-us"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-3 text-sm font-bold text-[var(--color-text-1)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
            >
              <Phone size={17} aria-hidden="true" />
              Contact details
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
