// Defines shared site metadata, contact details, and slug helpers.
export const SITE_NAME = "RF Telecom LB";
export const SITE_DESCRIPTION =
  "Professional telecom equipment, networking gear, security systems, and electrical equipment in Lebanon.";

export const CONTACT = {
  address:
    "Beirut, HaretHreik, Hadi Nasrallah Highway, facing KacoDoner, Near Snak Kassab",
  phones: ["+961 1 271 999", "+961 3 230 250"],
  email: "rftelecom@yahoo.com",
  country: "Lebanon",
  facebook: "https://facebook.com/rftelecomlb",
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type CatalogCollection = {
  name: string;
  slug: string;
  count?: number;
  displayOrder: number;
};

export const STATIC_PAGES = [
  { path: "/", title: "Home" },
  { path: "/products", title: "Products" },
  { path: "/categories", title: "Categories" },
  { path: "/checkout", title: "Checkout" },
  { path: "/search", title: "Search" },
  { path: "/about-us", title: "About Us" },
  { path: "/contact-us", title: "Contact Us" },
];

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1800&q=85";
