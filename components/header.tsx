"use client";

// RF Telecom LB - UX/UI pass
import clsx from "clsx";
import { ChevronDown, Loader2, Menu, RadioTower, Search, ShoppingBag, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import type { CatalogBrand, CatalogCategory, CatalogProduct } from "@/lib/catalog";
import { trackClientEvent } from "@/lib/client-analytics";
import { SITE_NAME } from "@/lib/site";

function categoryHref(category: CatalogCategory) {
  return `/categories/${category.slug}`;
}

function subcategoryHref(subcategory: CatalogCategory) {
  if (subcategory.categoryId && subcategory.subcategoryId) {
    return `/products?category_id=${encodeURIComponent(subcategory.categoryId)}&subcategory_id=${encodeURIComponent(
      subcategory.subcategoryId,
    )}`;
  }

  return `/categories/${subcategory.slug}`;
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold text-[var(--color-text-2)] transition-colors duration-150 hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
        active && "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
      )}
    >
      {label}
    </Link>
  );
}

function DropdownButton({
  active,
  open,
  label,
  onClick,
}: {
  active: boolean;
  open: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex h-10 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-[var(--color-text-2)] transition-colors duration-150 hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
        label === "Products" && "h-11 px-4 text-base",
        active && "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
      )}
      aria-expanded={open}
    >
      {label}
      <ChevronDown size={15} className={clsx("transition-transform duration-200", open && "rotate-180")} />
    </button>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${SITE_NAME} home`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white shadow-[var(--shadow-accent)]">
        <RadioTower size={19} aria-hidden="true" />
      </span>
      <span className="grid leading-none">
        <span className="text-base font-bold text-[var(--color-text-1)]">RF Telecom</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-2)]">
          Lebanon
        </span>
      </span>
    </Link>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<CatalogProduct[]>([]);
  const [menuCategories, setMenuCategories] = useState<CatalogCategory[]>([]);
  const [menuBrands, setMenuBrands] = useState<CatalogBrand[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const { count } = useCart();

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
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
    document.body.style.overflow = menuOpen || searchOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSearch();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeSearch, searchOpen]);

  useEffect(() => {
    let cancelled = false;

    async function loadMenuData() {
      try {
        const [categoriesResponse, brandsResponse] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/brands"),
        ]);
        const categoriesData = (await categoriesResponse.json()) as { categories?: CatalogCategory[] };
        const brandsData = (await brandsResponse.json()) as { brands?: CatalogBrand[] };

        if (!cancelled) {
          setMenuCategories(categoriesData.categories || []);
          setMenuBrands(brandsData.brands || []);
        }
      } catch {
        if (!cancelled) {
          setMenuCategories([]);
          setMenuBrands([]);
        }
      }
    }

    void loadMenuData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const term = search.trim();
    if (!searchOpen || term.length < 2) {
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
  }, [search, searchOpen]);

  function closeMenus() {
    setProductsOpen(false);
    setBrandsOpen(false);
  }

  function openProductsMenu() {
    setProductsOpen(true);
    setBrandsOpen(false);
  }

  function openBrandsMenu() {
    setBrandsOpen(true);
    setProductsOpen(false);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = search.trim();

    if (!term) {
      return;
    }

    void trackClientEvent("/api/analytics/search", { term });
    closeSearch();
    setMenuOpen(false);
    closeMenus();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <>
      <header
        className="sticky top-0 z-[100] border-b border-[var(--color-border)] bg-[var(--color-header)] text-[var(--color-text-1)] backdrop-blur-xl"
        onMouseLeave={closeMenus}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Logo />

          <nav className="ml-2 hidden items-center gap-1 lg:flex" aria-label="Primary">
            <NavLink href="/" label="Home" />
            <div onMouseEnter={openProductsMenu}>
              <DropdownButton
                active={pathname.startsWith("/products") || pathname.startsWith("/categories") || pathname.startsWith("/collections")}
                open={productsOpen}
                label="Products"
                onClick={() => {
                  setProductsOpen((open) => !open);
                  setBrandsOpen(false);
                }}
              />
            </div>
            <div onMouseEnter={openBrandsMenu}>
              <DropdownButton
                active={pathname.startsWith("/brands")}
                open={brandsOpen}
                label="Brands"
                onClick={() => {
                  setBrandsOpen((open) => !open);
                  setProductsOpen(false);
                }}
              />
            </div>
            <NavLink href="/about-us" label="About Us" />
            <NavLink href="/contact-us" label="Contact Us" />
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-text-2)] transition-colors duration-150 hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
            >
              <Search size={19} />
              <span className="hidden xl:inline">Search products...</span>
            </button>
            <Link
              href="/admin/login"
              className="hidden h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)] transition-colors duration-150 hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] sm:flex"
              aria-label="Admin login"
            >
              <UserRound size={18} />
            </Link>
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)] transition-colors duration-150 hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              aria-label="Cart"
            >
              <ShoppingBag size={18} />
              {count ? (
                <span className="mono-data absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              ) : null}
            </Link>
            <ThemeToggle />
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)] transition-colors duration-150 hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {productsOpen ? (
          <div
            className="absolute inset-x-0 top-full z-50 border-y border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-menu)]"
            onMouseEnter={openProductsMenu}
          >
            <div
              className="mx-auto grid max-w-7xl gap-x-8 gap-y-7 overflow-x-auto px-6 py-7 sm:px-8"
              style={{
                gridTemplateColumns: `repeat(${Math.max(menuCategories.length, 1)}, minmax(135px, 1fr))`,
              }}
            >
              {menuCategories.map((category) => (
                <div key={category.slug} className="min-w-0">
                  <p className="text-sm font-bold leading-5 text-[var(--color-text-1)]">
                    {category.name}
                  </p>
                  <div className="mt-4 grid gap-2.5">
                    {(category.children || []).map((subcategory) => (
                      <Link
                        key={subcategory.slug}
                        href={subcategoryHref(subcategory)}
                        onClick={closeMenus}
                        className="text-sm leading-5 text-[var(--color-text-2)] transition-colors duration-150 hover:text-[var(--color-text-1)]"
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {brandsOpen ? (
          <div
            className="absolute inset-x-0 top-full z-50 border-y border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-menu)]"
            onMouseEnter={openBrandsMenu}
          >
            <div className="mx-auto grid max-w-7xl gap-2 px-6 py-4 sm:grid-cols-3 lg:grid-cols-5">
              {menuBrands.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/brands/${brand.slug}`}
                  onClick={closeMenus}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm font-semibold text-[var(--color-text-1)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
                >
                  {brand.name}
                </Link>
              ))}
              {!menuBrands.length ? (
                <p className="text-sm text-[var(--color-text-2)]">No brands found.</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-[110] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[rgba(17,24,39,0.48)] backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu overlay"
          />
          <div className="absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col overflow-y-auto border-l border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-menu)]">
            <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-header-strong)] px-4">
              <Logo />
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-1)]"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={21} />
              </button>
            </div>

            <nav className="grid gap-1 p-4 text-base" aria-label="Mobile primary">
              <Link href="/" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 font-semibold hover:bg-[var(--color-surface-2)]">
                Home
              </Link>
              <Link href="/products" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 font-semibold hover:bg-[var(--color-surface-2)]">
                Products
              </Link>
              <Link href="/brands" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 font-semibold hover:bg-[var(--color-surface-2)]">
                Brands
              </Link>
              <Link href="/about-us" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 font-semibold hover:bg-[var(--color-surface-2)]">
                About Us
              </Link>
              <Link href="/contact-us" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 font-semibold hover:bg-[var(--color-surface-2)]">
                Contact Us
              </Link>
            </nav>

            <div className="px-4 pb-4">
              <p className="px-3 pb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-text-3)]">
                Shop by category
              </p>
              <div className="grid grid-cols-2 gap-2">
                {menuCategories.map((category) => (
                  <Link
                    key={category.slug}
                    href={categoryHref(category)}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm font-semibold text-[var(--color-text-1)] hover:bg-[var(--color-accent-soft)]"
                  >
                    <span className="line-clamp-1">{category.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-auto flex items-center gap-2 border-t border-[var(--color-border)] p-4">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm font-semibold text-[var(--color-text-1)] hover:bg-[var(--color-surface-2)]"
              >
                <Search size={16} aria-hidden="true" />
                Search
              </button>
              <Link
                href="/admin/login"
                onClick={() => setMenuOpen(false)}
                aria-label="Admin login"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)]"
              >
                <UserRound size={18} />
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {searchOpen ? (
        <div className="fixed inset-0 z-[120] bg-[var(--color-overlay)] backdrop-blur">
          <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-16 sm:px-8 sm:py-20">
            <button
              type="button"
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)] transition-colors duration-150 hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-1)]"
              onClick={closeSearch}
              aria-label="Close search"
            >
              <X size={22} />
            </button>
            <form onSubmit={submitSearch} className="grid gap-4">
              <label htmlFor="site-search" className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-text-3)]">
                Search products
              </label>
              <div className="flex overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-header)] focus-within:border-[var(--color-accent)]">
                <input
                  id="site-search"
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  autoFocus
                  placeholder="Routers, CCTV, batteries, cables..."
                  className="h-16 min-w-0 flex-1 bg-transparent px-4 text-lg text-[var(--color-text-1)] outline-none placeholder:text-[var(--color-text-3)]"
                />
                <button
                  type="submit"
                  className="flex h-16 w-16 items-center justify-center bg-[var(--color-accent)] text-white transition-colors duration-150 hover:bg-[var(--color-accent-dim)]"
                  aria-label="Search"
                >
                  <Search size={22} />
                </button>
              </div>
            </form>
            <div className="mt-8 min-h-40">
              {searchLoading ? (
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-2)]">
                  <Loader2 size={16} className="animate-spin" />
                  Searching catalog
                </div>
              ) : null}
              {!searchLoading && search.trim().length >= 2 && !searchResults.length ? (
                <p className="text-sm text-[var(--color-text-2)]">No products found for &quot;{search.trim()}&quot;.</p>
              ) : null}
              {searchResults.length ? (
                <div className="grid gap-3">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={closeSearch}
                      className="grid gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm transition-colors duration-150 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
                    >
                      <span className="block text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-accent)]">
                        {[product.category?.name, product.subcategory?.name].filter(Boolean).join(" / ")}
                      </span>
                      <span className="block truncate text-sm font-semibold text-[var(--color-text-1)]">{product.name}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
