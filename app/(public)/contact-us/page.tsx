// RF Telecom LB - UX/UI pass
import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { CONTACT, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Contact Us",
  path: "/contact-us",
  description:
    "Reach RF Telecom LB in Beirut, HaretHreik for telecom equipment, security systems, electronics, cables, batteries, and power equipment quotes.",
});

export default function ContactUsPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: `Contact ${SITE_NAME}`,
          url: absoluteUrl("/contact-us"),
          mainEntity: {
            "@type": "LocalBusiness",
            name: SITE_NAME,
            address: CONTACT.address,
            telephone: CONTACT.phones,
            email: CONTACT.email,
          },
        }}
      />
      <div className="mb-10 text-center">
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-text-3)]">Contact Us</p>
        <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] text-[var(--color-text-1)]">Reach Us</h1>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(0,102,255,0.12)] text-[var(--color-accent)]">
            <MapPin size={20} />
          </div>
          <h2 className="mt-5 font-semibold text-[var(--color-text-1)]">Location:</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--color-text-2)]">{CONTACT.address}</p>
        </article>
        <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(0,102,255,0.12)] text-[var(--color-accent)]">
            <Phone size={20} />
          </div>
          <h2 className="mt-5 font-semibold text-[var(--color-text-1)]">Phone:</h2>
          <p className="mt-3 text-sm text-[var(--color-text-2)]">Contact us for quotes and inquiries</p>
          <div className="mt-3 grid gap-1 text-sm font-medium text-[var(--color-text-1)]">
            {CONTACT.phones.map((phone) => (
              <a key={phone} href={`tel:${phone.replace(/\s/g, "")}`} className="hover:underline">
                {phone}
              </a>
            ))}
          </div>
        </article>
        <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(0,102,255,0.12)] text-[var(--color-accent)]">
            <Mail size={20} />
          </div>
          <h2 className="mt-5 font-semibold text-[var(--color-text-1)]">Email:</h2>
          <p className="mt-3 text-sm text-[var(--color-text-2)]">Quick Response</p>
          <a href={`mailto:${CONTACT.email}`} className="mt-3 block text-sm font-medium text-[var(--color-text-1)] hover:underline">
            {CONTACT.email}
          </a>
        </article>
      </div>
    </section>
  );
}
