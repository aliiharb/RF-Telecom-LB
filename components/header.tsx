"use client";

// RF Telecom LB - UX/UI pass
import clsx from "clsx";
import {
  Building2,
  Headphones,
  House,
  Info,
  Loader2,
  Package,
  RadioTower,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import type { CatalogProduct } from "@/lib/catalog";
import { trackClientEvent } from "@/lib/client-analytics";
import { SITE_NAME } from "@/lib/site";

const mainNav = [
  { href: "/", label: "Home", icon: House },
  { href: "/categories", label: "Products", icon: Package },
  { href: "/brands", label: "Brands", icon: Building2 },
  { href: "/about-us", label: "About Us", icon: Info },
  { href: "/contact-us", label: "Contact Us", icon: Headphones },
];

function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${SITE_NAME} home`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-[var(--shadow-rest)]">
        <RadioTower size={20} aria-hidden="true" />
      </span>
      <span className="grid leading-none">
        <span className="text-lg font-bold text-[var(--color-text-1)]">RF Telecom</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-2)]">
          Lebanon
        </span>
      </span>
    </Link>
  );
}

function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-end justify-center gap-8 md:flex" aria-label="Primary">
      {mainNav.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "group relative grid min-w-20 justify-items-center gap-1.5 pb-3 text-sm font-semibold text-[var(--color-text-2)] transition-colors duration-150 hover:text-[var(--color-text-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
              active && "text-[var(--color-text-1)]",
            )}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-1)] transition-transform duration-150 group-hover:-translate-y-0.5">
              <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span>{item.label}</span>
            <span
              className={clsx(
                "absolute bottom-0 h-0.5 rounded-full bg-[var(--color-text-1)] transition-all duration-150",
                active ? "w-16" : "w-0 group-hover:w-12",
              )}
              aria-hidden="true"
            />
          </Link>
        );
      })}
    </nav>
  );
}

export function Header() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<CatalogProduct[]>([]);
  const router = useRouter();
  const { count } = useCart();

  const closeSearch = useCallback(() => {
    setSearchFocused(false);
    setSearchResults([]);
    setSearchLoading(false);
  }, []);

  function handleSearchChange(value: string) {
    setSearch(value);

    if (value.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
    } else {
      setSearchLoading(true);
    }
  }

  useEffect(() => {
    if (!searchFocused) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSearch();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeSearch, searchFocused]);

  useEffect(() => {
    const term = search.trim();

    if (!searchFocused || term.length < 2) {
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      try {
        setSearchLoading(true);
        const response = await fetch(`/api/products?search=${encodeURIComponent(term)}&take=6`);
        const data = (await response.json()) as { products?: CatalogProduct[] };

        if (!cancelled) {
          setSearchResults(data.products || []);
        }
      } catch {
        if (!cancelled) {
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search, searchFocused]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = search.trim();

    if (!term) {
      return;
    }

    void trackClientEvent("/api/analytics/search", { term });
    closeSearch();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <header className="sticky top-0 z-[100] border-b border-[var(--color-border)] bg-[var(--color-header)] text-[var(--color-text-1)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-[1760px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 pt-5 sm:px-8 lg:px-12">
        <Logo />
        <MainNav />
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/login"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-[var(--color-text-1)] transition-colors duration-150 hover:bg-[var(--color-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            aria-label="Login"
          >
            <UserRound size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Login</span>
          </Link>
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-1)] transition-colors duration-150 hover:bg-[#eeeeee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            aria-label="Cart"
          >
            <ShoppingBag size={18} aria-hidden="true" />
            {count ? (
              <span className="mono-data absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1760px] px-4 pb-6 pt-5 sm:px-8 lg:px-12">
        <form onSubmit={submitSearch} className="relative mx-auto max-w-[860px]">
          <div className="flex min-h-16 items-center overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition-shadow duration-150 hover:shadow-[0_8px_24px_rgba(0,0,0,0.16)] focus-within:shadow-[0_8px_24px_rgba(0,0,0,0.16)]">
            <label htmlFor="site-search" className="grid min-w-0 flex-1 gap-0.5 px-8 py-3">
              <span className="text-xs font-bold leading-none text-[var(--color-text-1)]">Search</span>
              <input
                id="site-search"
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search products, brands, and categories"
                className="min-w-0 bg-transparent text-[15px] font-medium leading-5 text-[var(--color-text-1)] outline-none placeholder:text-[var(--color-text-2)]"
              />
            </label>
            <button
              type="submit"
              className="header-search-submit mr-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
              aria-label="Search"
            >
              <Search size={19} aria-hidden="true" />
            </button>
          </div>

          {searchFocused && search.trim().length >= 2 ? (
            <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-[min(520px,calc(100vw-2rem))] animate-[dropdownIn_150ms_ease-out] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-floating)]">
              {searchLoading ? (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--color-text-2)]">
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Searching catalog
                </div>
              ) : null}
              {!searchLoading && !searchResults.length ? (
                <p className="px-4 py-3 text-sm text-[var(--color-text-2)]">
                  No products found for &quot;{search.trim()}&quot;.
                </p>
              ) : null}
              {searchResults.length ? (
                <div className="grid max-h-[420px] gap-1 overflow-y-auto pr-1 [scrollbar-color:#DDDDDD_transparent] [scrollbar-width:thin]">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={closeSearch}
                      className="grid gap-1 rounded-xl px-4 py-3 transition-colors duration-150 hover:bg-[var(--color-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                    >
                      <span className="block text-xs font-semibold text-[var(--color-text-2)]">
                        {[product.category?.name, product.subcategory?.name].filter(Boolean).join(" / ") || "Product"}
                      </span>
                      <span className="block truncate text-sm font-semibold text-[var(--color-text-1)]">
                        {product.name}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </form>
      </div>
    </header>
  );
}
