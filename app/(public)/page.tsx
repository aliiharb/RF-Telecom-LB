// RF Telecom LB - professional storefront redesign
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Cable,
  Cpu,
  Headset,
  MessageCircle,
  Network,
  Phone,
  Plug,
  RadioTower,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { getBrands, getCategories } from "@/lib/catalog";
import { buildMetadata, localBusinessJsonLd, websiteJsonLd } from "@/lib/seo";
import { SITE_DESCRIPTION } from "@/lib/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  path: "/",
  title: "Professional Telecom Equipment in Lebanon",
  description:
    "Shop professional telecom equipment, networking gear, security systems, and electrical equipment in Lebanon. RF Telecom LB offers Grandstream, Panasonic, TP-Link, Yealink and more.",
});

const categoryIcons = [Network, ShieldCheck, Cable, Plug, Zap, Cpu, RadioTower, Phone];

const strengths = [
  {
    icon: ShieldCheck,
    title: "Verified equipment",
    text: "Known brands, clear specs, and support before you commit.",
  },
  {
    icon: Truck,
    title: "Lebanon delivery",
    text: "Orders prepared for shops, installers, homes, and company sites.",
  },
  {
    icon: Headset,
    title: "Technical guidance",
    text: "Send the site requirement and get practical product matching.",
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

  const heroCategories = categories.slice(0, 5);
  const categorySpotlight = categories.slice(0, 6);
  const featuredBrands = brands.slice(0, 8);

  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />
      <JsonLd data={websiteJsonLd()} />

      <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,var(--color-surface-2),transparent)]" />
        <div className="relative mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-14">
          <div className="max-w-2xl">
            <h1 className="text-[clamp(2.65rem,6vw,5.9rem)] font-black leading-[0.94] text-[var(--color-text-1)]">
              RF Telecom
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[var(--color-text-2)] sm:text-lg">
              {SITE_DESCRIPTION} Source phones, networking, CCTV, cables, tools, power, and solar equipment with one specialist team.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/products" className="btn-primary">
                Browse products
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a
                href={buildWhatsAppUrl("Hi RF Telecom LB, I need help choosing telecom equipment.")}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost bg-[var(--color-surface)] text-[var(--color-text-1)]"
              >
                <MessageCircle size={16} aria-hidden="true" />
                Request guidance
              </a>
            </div>
            {heroCategories.length ? (
              <div className="mt-8 flex flex-wrap gap-2">
                {heroCategories.map((category, index) => {
                  const Icon = categoryIcons[index % categoryIcons.length];

                  return (
                    <Link
                      key={category.slug}
                      href={`/categories/${category.slug}`}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-semibold text-[var(--color-text-2)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-text-1)]"
                    >
                      <Icon size={15} className="text-[var(--color-accent)]" aria-hidden="true" />
                      {category.name}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
              <Image
                src="/images/telecom-operations-hero.png"
                alt="Professional telecom hardware, fiber cables, network switches, and test equipment on an installation bench"
                width={1536}
                height={960}
                priority
                className="aspect-[16/10] h-full w-full object-cover"
              />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {strengths.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm"
                >
                  <item.icon size={19} className="mb-3 text-[var(--color-accent)]" aria-hidden="true" />
                  <h2 className="text-sm font-bold text-[var(--color-text-1)]">{item.title}</h2>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-text-2)]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
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
