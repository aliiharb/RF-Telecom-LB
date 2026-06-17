// RF Telecom LB - UX/UI pass
import Link from "next/link";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-[var(--color-text-2)]">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span className="text-[var(--color-text-3)]">/</span> : null}
            {item.href ? (
              <Link className="hover:text-[var(--color-text-1)]" href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span className="text-[var(--color-text-1)]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
