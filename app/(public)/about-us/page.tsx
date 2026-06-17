// RF Telecom LB - UX/UI pass
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  path: "/about-us",
  description:
    "Learn about RF Telecom LB, a trusted Lebanon communications and electronics store with over 40 years of experience.",
});

export default function AboutUsPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 sm:p-12">
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-text-3)]">About Us</p>
        <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] text-[var(--color-text-1)]">Our Story</h1>
        <div className="mt-8 grid gap-6 text-base leading-8 text-[var(--color-text-2)]">
          <p>
            For over 40 years, RF Telecom LB has stood as a trusted name in Lebanon&apos;s communications
            and electronics industry. Founded by a seasoned communications and electronic engineer, our
            store was born out of a passion for connecting people through reliable technology.
          </p>
          <p>
            We offer a comprehensive selection of high-quality products &mdash; from telephones, connectors,
            routers, and wireless solutions to CCTV systems, testing & measurement tools, power supplies,
            batteries, solar inverters, and more.
          </p>
          <p>
            Our mission is simple: to provide top-notch equipment that empowers individuals and businesses
            to stay connected, safe, and efficient. We sell because we believe communication and safety
            shouldn&apos;t be compromised, and because excellent technology delivered with expertise can make a
            meaningful difference every day.
          </p>
        </div>
      </div>
    </section>
  );
}
