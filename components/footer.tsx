// RF Telecom LB - UX/UI pass
import { Mail, MapPin, MessageCircle, Phone, RadioTower } from "lucide-react";
import Link from "next/link";
import { CONTACT, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-1)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_0.8fr_0.9fr] lg:px-8">
        <div className="grid gap-4">
          <Link href="/" className="flex w-fit items-center gap-2.5" aria-label={`${SITE_NAME} home`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white">
              <RadioTower size={18} aria-hidden="true" />
            </span>
            <span className="text-base font-bold">{SITE_NAME}</span>
          </Link>
          <p className="max-w-md text-sm leading-6 text-[var(--color-text-2)]">{SITE_DESCRIPTION}</p>
          <p className="max-w-xl text-sm leading-6 text-[var(--color-text-2)]">
            Telecom equipment, security systems, connectors, cables, testing tools, power supplies,
            routers, CCTV, solar inverters, batteries, and electronics for homes and businesses in Lebanon.
          </p>
          <a
            href={buildWhatsAppUrl("Hi RF Telecom LB, I need help with a product.")}
            target="_blank"
            rel="noreferrer"
            className="btn-primary w-fit"
          >
            <MessageCircle size={16} aria-hidden="true" />
            Order on WhatsApp
          </a>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-text-3)]">Company</h3>
          <nav className="mt-4 grid gap-2 text-sm leading-7 text-[var(--color-text-2)]">
            <Link href="/" className="transition-colors duration-150 hover:text-[var(--color-text-1)]">
              Home
            </Link>
            <Link href="/products" className="transition-colors duration-150 hover:text-[var(--color-text-1)]">
              Products
            </Link>
            <Link href="/brands" className="transition-colors duration-150 hover:text-[var(--color-text-1)]">
              Brands
            </Link>
            <Link href="/about-us" className="transition-colors duration-150 hover:text-[var(--color-text-1)]">
              About Us
            </Link>
            <Link href="/contact-us" className="transition-colors duration-150 hover:text-[var(--color-text-1)]">
              Contact Us
            </Link>
          </nav>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-text-3)]">Contact Info</h3>
          <div className="mt-4 grid gap-3 text-sm leading-6 text-[var(--color-text-2)]">
            <p className="flex gap-2">
              <MapPin size={16} className="mt-1 shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
              <span>{CONTACT.address}</span>
            </p>
            {CONTACT.phones.map((phone) => (
              <a key={phone} href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-2 transition-colors duration-150 hover:text-[var(--color-text-1)]">
                <Phone size={16} className="text-[var(--color-accent)]" aria-hidden="true" />
                {phone}
              </a>
            ))}
            <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 transition-colors duration-150 hover:text-[var(--color-text-1)]">
              <Mail size={16} className="text-[var(--color-accent)]" aria-hidden="true" />
              {CONTACT.email}
            </a>
            <a href={CONTACT.facebook} className="transition-colors duration-150 hover:text-[var(--color-text-1)]" target="_blank" rel="noreferrer">
              Facebook
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] px-4 py-4 text-center text-[13px] text-[var(--color-text-3)] sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span>&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
        <span>Telecom and electronics equipment in Lebanon.</span>
      </div>
    </footer>
  );
}
