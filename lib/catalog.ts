import { createClient } from "@supabase/supabase-js";
import catalogSnapshot from "@/lib/catalog-snapshot.json";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { CatalogCollection } from "@/lib/site";
import { SITE_DESCRIPTION, slugify } from "@/lib/site";

export const BRANDS = [
  "AEG",
  "British Telecom",
  "Delta",
  "Grandstream",
  "Metas",
  "Mikrotik",
  "Panasonic",
  "Shami",
  "Power Flash",
  "TP-Link",
  "Ubiquiti",
  "UNI-T",
  "Yeastar",
  "Yealink",
];

export type Category = {
  id: string;
  name: string;
  slug?: string | null;
  created_at?: string;
};

export type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug?: string | null;
  collection_handle: string;
  created_at?: string;
};

export type Product = {
  id: string;
  subcategory_id: string;
  name: string;
  product_url: string;
  created_at?: string;
};

export type ProductCatalogItem = {
  product_id: string;
  category_id: string;
  category: string;
  subcategory_id: string;
  sub_category: string;
  collection_handle: string;
  product_name: string;
  product_url: string;
  created_at?: string;
};

export type CatalogImage = {
  id?: string;
  url: string;
  alt?: string | null;
  position?: number;
};

export type CatalogBrand = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  displayOrder?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  categoryId?: string | null;
  subcategoryId?: string | null;
  collectionHandle?: string | null;
  fullPath?: string | null;
  depth?: number | null;
  parentId?: string | null;
  parent?: CatalogCategory | null;
  children?: CatalogCategory[];
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  displayOrder?: number;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  productUrl: string;
  product_url: string;
  category?: CatalogCategory | null;
  subcategory?: CatalogCategory | null;
  collectionHandle?: string | null;
  collection?: string | null;
  collectionSlug?: string | null;
  brand?: CatalogBrand | null;
  sku?: string | null;
  shortDescription?: string | null;
  fullDescription?: string | null;
  specifications: Record<string, string>;
  price?: number | null;
  compareAtPrice?: number | null;
  currency: string;
  availability: string;
  images: CatalogImage[];
  featured: boolean;
  published: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  imageAltText?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductListOptions = {
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  subcategorySearch?: string;
  brandSlug?: string;
  collectionSlug?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  featured?: boolean;
  take?: number;
};

type PrismaCategoryRow = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  displayOrder: number;
  parent?: PrismaCategoryRow | null;
};

type PrismaBrandRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  displayOrder: number;
};

type PrismaProductImageRow = {
  id: string;
  url: string;
  alt: string | null;
  position: number;
};

type PrismaProductRow = {
  id: string;
  name: string;
  slug: string;
  brand?: PrismaBrandRow | null;
  category?: PrismaCategoryRow | null;
  subcategory?: PrismaCategoryRow | null;
  sku: string | null;
  shortDescription: string | null;
  fullDescription: string | null;
  specifications: unknown;
  price: unknown;
  currency: string;
  availability: string;
  images?: PrismaProductImageRow[];
  featured: boolean;
  published: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  imageAltText: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type SupabaseCategoryRelation = {
  id: number | string;
  name: string;
};

type SupabaseSubcategoryRelation = {
  id: number | string;
  name: string;
  category_id: number | string;
  categories?: SupabaseCategoryRelation | SupabaseCategoryRelation[] | null;
};

type SupabaseProductRow = {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  price: number | null;
  brand_id: number | string | null;
  sku: string | null;
  status: string | null;
  spec_pdf_url: string | null;
  created_at: string;
  updated_at: string | null;
  brands?: {
    id: number | string;
    name: string;
    slug: string;
    description?: string | null;
  } | Array<{
    id: number | string;
    name: string;
    slug: string;
    description?: string | null;
  }> | null;
  product_subcategories?: Array<{
    subcategory_id: number | string;
    subcategories?: SupabaseSubcategoryRelation | SupabaseSubcategoryRelation[] | null;
  }> | null;
  product_images?: Array<{
    id: string;
    url: string;
    position: number | null;
  }> | null;
};

type SupabaseBrandRow = {
  id: number | string;
  name: string;
  slug: string;
  description: string | null;
  featured?: boolean | null;
};

const STATIC_CATALOG = catalogSnapshot as {
  categories: CatalogCategory[];
  products: CatalogProduct[];
  brands: CatalogBrand[];
};

const CATEGORY_ORDER = [
  "telecom-and-phones",
  "telecom-phones",
  "connectors",
  "cabels",
  "cables",
  "security",
  "testing-and-measurement-tools",
  "testing-measurement-tools",
  "electric-equipment",
  "electronics",
];

const SUBCATEGORY_ORDER = [
  "accessories",
  "analog-and-ip-corded-phone",
  "analog-and-ip-cordless-phone",
  "analog-pbax",
  "voip-and-ip-systems",
  "switch-poe",
  "router",
  "interphone",
  "others",
  "all-connectros",
  "all-connectors",
  "bnc",
  "f-type",
  "n-type",
  "pl",
  "rca",
  "sma",
  "tnc",
  "crimping-tools",
  "fiber-optic-cables",
  "hdmi-cables",
  "network-cables",
  "network-cables-accessories",
  "power-cables",
  "rf-cables",
  "telephone-cables",
  "telephone-cable-accessories",
  "vga-cables",
  "cctv",
  "door-lock",
  "door-viewer",
  "remote-and-receiver",
  "signal-blocking",
  "spy-camera",
  "voice-recorder",
  "thermostat-and-ac-control",
  "liquid-level-meter",
  "cable-testing",
  "uni-t",
  "solar-testing",
  "adapters",
  "aeg-lamp",
  "backup",
  "delta-stabilizers",
  "electrics",
  "metas-stabilizers",
  "power-supply",
  "solar-inverters",
  "batteries",
  "converters",
  "solar-batteries",
];

const DATABASE_TAXONOMY = [
  {
    categoryId: "1",
    name: "Telephone and Phones",
    slug: "telecom-and-phones",
    aliases: ["telephone-and-phones", "telecom-and-phones", "telecom-phones", "telecom-and-phones"],
    subcategories: [
      {
        subcategoryId: "1",
        name: "Telephone Accessories & Tools",
        slug: "accessories",
        aliases: ["telephone-accessories-and-tools", "accessories"],
      },
      { subcategoryId: "2", name: "Analog and IP Corded Phone", slug: "analog-and-ip-corded-phone", aliases: [] },
      { subcategoryId: "3", name: "Analog and IP Cordless Phone", slug: "analog-and-ip-cordless-phone", aliases: [] },
      { subcategoryId: "4", name: "Analog PBAX", slug: "analog-pbax", aliases: [] },
      { subcategoryId: "5", name: "VOIP and IP Systems", slug: "voip-and-ip-systems", aliases: [] },
      { subcategoryId: "6", name: "Switch POE", slug: "switch-poe", aliases: [] },
      { subcategoryId: "7", name: "Router", slug: "router", aliases: [] },
      { subcategoryId: "8", name: "Interphone", slug: "interphone", aliases: [] },
      { subcategoryId: "9", name: "Others", slug: "others", aliases: [] },
    ],
  },
  {
    categoryId: "2",
    name: "Connectors",
    slug: "connectors",
    aliases: [],
    subcategories: [
      { subcategoryId: "10", name: "All Connectors", slug: "all-connectors", aliases: ["all-connectros"] },
      { subcategoryId: "11", name: "BNC", slug: "bnc", aliases: [] },
      { subcategoryId: "12", name: "F Type", slug: "f-type", aliases: ["f-type", "f type"] },
      { subcategoryId: "13", name: "N Type", slug: "n-type", aliases: ["n-type", "n type"] },
      { subcategoryId: "14", name: "PL", slug: "pl", aliases: [] },
      { subcategoryId: "15", name: "RCA", slug: "rca", aliases: [] },
      { subcategoryId: "16", name: "SMA", slug: "sma", aliases: [] },
      { subcategoryId: "17", name: "TNC", slug: "tnc", aliases: [] },
    ],
  },
  {
    categoryId: "3",
    name: "Cables",
    slug: "cables",
    aliases: [],
    subcategories: [
      {
        subcategoryId: "18",
        name: "Crimping Tools",
        slug: "crimping-tools",
        aliases: ["Cables_crimping_tool", "cables-crimping-tool", "crimping-tool"],
      },
      {
        subcategoryId: "19",
        name: "Fiber Optic Cables",
        slug: "fiber-optic-cables",
        aliases: ["fiber-optic-cable", "Cables_fiber_optic_cable", "cables-fiber-optic-cable"],
      },
      { subcategoryId: "20", name: "HDMI Cables", slug: "hdmi-cables", aliases: [] },
      {
        subcategoryId: "21",
        name: "Network Cables",
        slug: "network-cables",
        aliases: ["network-cable", "Cables_network_cable", "cables-network-cable"],
      },
      { subcategoryId: "22", name: "Network Cables Accessories", slug: "network-cables-accessories", aliases: [] },
      { subcategoryId: "23", name: "Power Cables", slug: "power-cables", aliases: [] },
      {
        subcategoryId: "24",
        name: "RF Cables",
        slug: "rf-cables",
        aliases: ["rf-cable", "Cables_rf_cable", "cables-rf-cable"],
      },
      { subcategoryId: "25", name: "Telephone Cables", slug: "telephone-cables", aliases: [] },
      { subcategoryId: "26", name: "Telephone Cable Accessories", slug: "telephone-cable-accessories", aliases: [] },
      {
        subcategoryId: "27",
        name: "VGA Cables",
        slug: "vga-cables",
        aliases: ["vga-cable", "Cables_vga_cable", "cables-vga-cable"],
      },
    ],
  },
  {
    categoryId: "4",
    name: "Security",
    slug: "security",
    aliases: [],
    subcategories: [
      { subcategoryId: "29", name: "CCTV", slug: "cctv", aliases: ["Security_CCTV", "security-cctv"] },
      { subcategoryId: "30", name: "Door Lock", slug: "door-lock", aliases: ["Security_door_lock", "security-door-lock"] },
      { subcategoryId: "31", name: "Door Viewer", slug: "door-viewer", aliases: ["Security_door_viewer", "security-door-viewer"] },
      {
        subcategoryId: "32",
        name: "Remote and Receiver",
        slug: "remote-and-receiver",
        aliases: ["Security_remote_and_receiver", "security-remote-and-receiver"],
      },
      {
        subcategoryId: "33",
        name: "Signal Blocking",
        slug: "signal-blocking",
        aliases: ["Security_signal_blocking", "security-signal-blocking"],
      },
      { subcategoryId: "34", name: "Spy Camera", slug: "spy-camera", aliases: ["Security_spy_camera", "security-spy-camera"] },
      {
        subcategoryId: "35",
        name: "Voice Recorder",
        slug: "voice-recorder",
        aliases: ["Security_voice_recorder", "security-voice-recorder"],
      },
    ],
  },
  {
    categoryId: "5",
    name: "Testing and Measurement Tools",
    slug: "testing-and-measurement-tools",
    aliases: ["testing-measurement-tools"],
    subcategories: [
      {
        subcategoryId: "36",
        name: "Thermostat and AC Control",
        slug: "thermostat-and-ac-control",
        aliases: ["Testing_and_Measurement_Tools_thermostat_and_ac_control", "thermostat-ac-control"],
      },
      {
        subcategoryId: "37",
        name: "Liquid Level Meter",
        slug: "liquid-level-meter",
        aliases: ["Testing_and_Measurement_Tools_liquid_level_meter"],
      },
      {
        subcategoryId: "38",
        name: "Cable Testing",
        slug: "cable-testing",
        aliases: ["Testing_and_Measurement_Tools_cable_testing"],
      },
      { subcategoryId: "39", name: "UNI-T", slug: "uni-t", aliases: ["Testing_and_Measurement_Tools_uni_t", "unit"] },
      {
        subcategoryId: "40",
        name: "Solar Testing",
        slug: "solar-testing",
        aliases: ["Testing_and_Measurement_Tools_solar_testing"],
      },
    ],
  },
  {
    categoryId: "6",
    name: "Electric Equipment",
    slug: "electric-equipment",
    aliases: ["electric-equipment"],
    subcategories: [
      { subcategoryId: "41", name: "Adapters", slug: "adapters", aliases: ["Electric_Equipment_adapters"] },
      { subcategoryId: "42", name: "AEG Lamp", slug: "aeg-lamp", aliases: ["Electric_Equipment_aeg_lamp"] },
      { subcategoryId: "43", name: "Backup", slug: "backup", aliases: ["Electric_Equipment_backup"] },
      {
        subcategoryId: "44",
        name: "Delta Stabilizers",
        slug: "delta-stabilizers",
        aliases: ["Electric_Equipment_delta_stabilizers"],
      },
      { subcategoryId: "45", name: "Electrics", slug: "electrics", aliases: ["Electric_Equipment_electrics"] },
      {
        subcategoryId: "46",
        name: "Metas Stabilizers",
        slug: "metas-stabilizers",
        aliases: ["Electric_Equipment_metas_stabilizers"],
      },
      { subcategoryId: "47", name: "Power Supply", slug: "power-supply", aliases: ["Electric_Equipment_power_supply"] },
      {
        subcategoryId: "48",
        name: "Solar Inverters",
        slug: "solar-inverters",
        aliases: ["Electric_Equipment_solar_inverters"],
      },
    ],
  },
  {
    categoryId: "7",
    name: "Electronics",
    slug: "electronics",
    aliases: [],
    subcategories: [
      { subcategoryId: "50", name: "Batteries", slug: "batteries", aliases: ["Electronics_batteries"] },
      { subcategoryId: "51", name: "Converters", slug: "converters", aliases: ["Electronics_converters"] },
      { subcategoryId: "52", name: "Solar Batteries", slug: "solar-batteries", aliases: ["Electronics_solar_batteries"] },
    ],
  },
];

const SUPABASE_TITLE_FILTER_SUBCATEGORIES: Record<string, string[]> = {
  "18": ["crimping tool"],
  "19": ["fiber optic cable", "fiber patch cord"],
  "20": ["cable hdmi"],
  "21": ["cable network"],
  "25": ["telephone cord", "telephone flat cable"],
  "26": ["telephone plug", "telephone line splitter"],
  "27": ["cable vga"],
};

let prismaCategoryCount: number | null = null;
let prismaProductCount: number | null = null;
let prismaBrandCount: number | null = null;

export function brandToSlug(brand: string) {
  return slugify(brand);
}

export function slugToBrand(slug: string) {
  return BRANDS.find((brand) => brandToSlug(brand) === slug) || null;
}

function getSupabaseCatalogClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key || key.includes("...")) {
    return null;
  }

  return createClient(url, key);
}

function catalogError(message: string, error?: unknown) {
  if (error) {
    logger.error("Catalog", message, error);
  }
}

function normalizeSearch(value?: string | null) {
  return (value || "").trim();
}

function sanitizeLikeTerm(value: string) {
  return value.replace(/[%,()]/g, " ").replace(/\s+/g, " ").trim();
}

function orderedIndex(order: string[], value: string) {
  const slug = slugify(value);
  const index = order.indexOf(slug);
  return index === -1 ? order.length + 1 : index;
}

function taxonomyKeys(values: Array<string | null | undefined>) {
  return values.flatMap((value) => {
    if (!value) {
      return [];
    }

    return [value.toLowerCase(), slugify(value)];
  });
}

function matchesTaxonomyValue(value: string | null | undefined, keys: string[]) {
  if (!value) {
    return false;
  }

  const normalized = value.toLowerCase();
  const slug = slugify(value);
  return keys.includes(normalized) || keys.includes(slug);
}

function categoryMappingKeys(mapping: (typeof DATABASE_TAXONOMY)[number]) {
  return taxonomyKeys([mapping.categoryId, mapping.name, mapping.slug, ...mapping.aliases]);
}

function subcategoryMappingKeys(
  subcategory: (typeof DATABASE_TAXONOMY)[number]["subcategories"][number],
) {
  return taxonomyKeys([subcategory.subcategoryId, subcategory.name, subcategory.slug, ...subcategory.aliases]);
}

function findDatabaseCategory(value: string | null | undefined) {
  return DATABASE_TAXONOMY.find((mapping) => matchesTaxonomyValue(value, categoryMappingKeys(mapping)));
}

function findDatabaseSubcategory(value: string | null | undefined) {
  for (const category of DATABASE_TAXONOMY) {
    const subcategory = category.subcategories.find((item) =>
      matchesTaxonomyValue(value, subcategoryMappingKeys(item)),
    );

    if (subcategory) {
      return { category, subcategory };
    }
  }

  return null;
}

function categorySlugLookupValues(value: string | null | undefined) {
  const mapping = findDatabaseCategory(value);
  return mapping ? [mapping.slug, ...mapping.aliases] : value ? [value] : [];
}

function subcategorySlugLookupValues(value: string | null | undefined) {
  const mapping = findDatabaseSubcategory(value);
  return mapping ? [mapping.subcategory.slug, ...mapping.subcategory.aliases] : value ? [value] : [];
}

function withDatabaseTaxonomy(category: CatalogCategory, parentMapping = findDatabaseCategory(category.parent?.slug)) {
  const isSubcategory = Boolean(category.parentId || category.parent);
  const categoryMapping = isSubcategory
    ? parentMapping || findDatabaseCategory(category.parent?.id) || findDatabaseCategory(category.parentId)
    : findDatabaseCategory(category.id) || findDatabaseCategory(category.slug) || findDatabaseCategory(category.name);
  const subcategoryMapping = isSubcategory
    ? categoryMapping?.subcategories.find((item) =>
        [
          category.subcategoryId,
          category.id,
          category.slug,
          category.name,
          category.collectionHandle,
        ].some((value) => matchesTaxonomyValue(value, subcategoryMappingKeys(item))),
      )
    : null;
  const mappedParent =
    category.parent && categoryMapping
      ? {
          ...category.parent,
          name: categoryMapping.name,
          categoryId: categoryMapping.categoryId,
          subcategoryId: null,
        }
      : category.parent;
  const mappedCategory: CatalogCategory = {
    ...category,
    name: subcategoryMapping?.name || (!isSubcategory && categoryMapping?.name) || category.name,
    categoryId: categoryMapping?.categoryId || category.categoryId || null,
    subcategoryId: subcategoryMapping?.subcategoryId || category.subcategoryId || null,
    parent: mappedParent,
  };

  if (mappedCategory.children?.length) {
    mappedCategory.children = mappedCategory.children.map((child) =>
      withDatabaseTaxonomy(child, categoryMapping || findDatabaseCategory(mappedCategory.id)),
    );
  }

  return mappedCategory;
}

function sortCategoriesForMenu(categories: CatalogCategory[]) {
  return [...categories].sort(
    (a, b) =>
      orderedIndex(CATEGORY_ORDER, a.name) - orderedIndex(CATEGORY_ORDER, b.name) ||
      a.name.localeCompare(b.name),
  );
}

function sortSubcategoriesForMenu(subcategories: CatalogCategory[]) {
  return [...subcategories].sort(
    (a, b) =>
      orderedIndex(SUBCATEGORY_ORDER, a.name) - orderedIndex(SUBCATEGORY_ORDER, b.name) ||
      a.name.localeCompare(b.name),
  );
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

function hasConfiguredDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("USER:PASSWORD"));
}

async function countPrismaCatalogRows(label: string, countRows: () => Promise<number>) {
  if (!hasConfiguredDatabaseUrl()) {
    return 0;
  }

  try {
    return await countRows();
  } catch (error) {
    catalogError(`Prisma ${label} unavailable; falling back to external catalog data.`, error);
    return 0;
  }
}

async function hasPrismaCategories() {
  prismaCategoryCount ??= await countPrismaCatalogRows("categories", () => prisma.category.count());
  return prismaCategoryCount > 0;
}

async function hasPrismaProducts() {
  prismaProductCount ??= await countPrismaCatalogRows("products", () =>
    prisma.product.count({ where: { published: true } }),
  );
  return prismaProductCount > 0;
}

async function hasPrismaBrands() {
  prismaBrandCount ??= await countPrismaCatalogRows("brands", () => prisma.brand.count());
  return prismaBrandCount > 0;
}

async function hasAnyPrismaCatalogData() {
  const [categories, products, brands] = await Promise.all([
    hasPrismaCategories(),
    hasPrismaProducts(),
    hasPrismaBrands(),
  ]);

  return categories || products || brands;
}

function productMatchesBrandName(productName: string, brandName: string) {
  const name = productName.toLowerCase();
  const brand = brandName.toLowerCase();

  if (brandName === "British Telecom") {
    return (
      name.includes("british telecom") ||
      name.includes("telephone bt") ||
      /\bbt\b/i.test(productName)
    );
  }

  return name.includes(brand);
}

function getStaticCategories() {
  return sortCategoriesForMenu(
    STATIC_CATALOG.categories.map((category) => ({
      ...category,
      children: category.children ? sortSubcategoriesForMenu(category.children) : [],
    })),
  );
}

function getStaticBrands() {
  return [...STATIC_CATALOG.brands].sort(
    (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || a.name.localeCompare(b.name),
  );
}

function productMatchesCategory(product: CatalogProduct, value?: string) {
  if (!value) {
    return true;
  }

  const lookup = [
    ...categorySlugLookupValues(value),
    value,
  ].filter(Boolean);

  return lookup.some(
    (item) =>
      product.category?.slug === item ||
      product.category?.id === item ||
      product.category?.categoryId === item ||
      product.category?.name.toLowerCase() === item.toLowerCase(),
  );
}

function productMatchesSubcategory(product: CatalogProduct, value?: string) {
  if (!value) {
    return true;
  }

  const lookup = [
    ...subcategorySlugLookupValues(value),
    value,
  ].filter(Boolean);

  return lookup.some(
    (item) =>
      product.subcategory?.slug === item ||
      product.subcategory?.id === item ||
      product.subcategory?.subcategoryId === item ||
      product.collectionHandle === item ||
      product.collectionSlug === item ||
      product.subcategory?.name.toLowerCase() === item.toLowerCase(),
  );
}

function getStaticProducts(options: ProductListOptions = {}) {
  const search = normalizeSearch(options.search).toLowerCase();
  const subcategorySearch = normalizeSearch(options.subcategorySearch).toLowerCase();
  let products = STATIC_CATALOG.products.filter((product) => product.published !== false);

  if (options.featured !== undefined) {
    products = products.filter((product) => product.featured === options.featured);
  }

  if (options.categorySlug || options.categoryId) {
    products = products.filter(
      (product) =>
        productMatchesCategory(product, options.categorySlug) ||
        productMatchesCategory(product, options.categoryId),
    );
  }

  if (options.subcategorySlug || options.subcategoryId) {
    products = products.filter(
      (product) =>
        productMatchesSubcategory(product, options.subcategorySlug) ||
        productMatchesSubcategory(product, options.subcategoryId),
    );
  }

  if (options.collectionSlug) {
    products = products.filter(
      (product) =>
        productMatchesSubcategory(product, options.collectionSlug) ||
        product.category?.slug === options.collectionSlug,
    );
  }

  if (options.brandSlug) {
    const brandName = slugToBrand(options.brandSlug) || options.brandSlug;
    products = products.filter((product) => productMatchesBrandName(product.name, brandName));
  }

  if (options.minPrice || options.maxPrice) {
    products = products.filter((product) => {
      const price = product.price;
      if (price === null || price === undefined) {
        return false;
      }

      return (
        (!options.minPrice || price >= Number(options.minPrice)) &&
        (!options.maxPrice || price <= Number(options.maxPrice))
      );
    });
  }

  if (subcategorySearch) {
    products = products.filter(
      (product) =>
        product.name.toLowerCase().includes(subcategorySearch) ||
        product.category?.name.toLowerCase().includes(subcategorySearch) ||
        product.subcategory?.name.toLowerCase().includes(subcategorySearch),
    );
  }

  if (search) {
    products = products.filter(
      (product) =>
        product.name.toLowerCase().includes(search) ||
        product.sku?.toLowerCase().includes(search) ||
        product.category?.name.toLowerCase().includes(search) ||
        product.subcategory?.name.toLowerCase().includes(search) ||
        product.collectionHandle?.toLowerCase().includes(search),
    );
  }

  products = [...products].sort(
    options.sort === "name-az"
      ? (a, b) => a.name.localeCompare(b.name)
      : (a, b) =>
          (a.category?.name || "").localeCompare(b.category?.name || "") ||
          (a.subcategory?.name || "").localeCompare(b.subcategory?.name || "") ||
          a.name.localeCompare(b.name),
  );

  return options.take ? products.slice(0, options.take) : products;
}

function makeCategory(row: Pick<Category, "id" | "name" | "slug">, displayOrder = 0): CatalogCategory {
  const slug = row.slug || slugify(row.name);

  return withDatabaseTaxonomy({
    id: row.id,
    name: row.name,
    slug,
    fullPath: row.name,
    depth: 0,
    parentId: null,
    children: [],
    description: `${row.name} products available from RF Telecom LB in Lebanon.`,
    seoTitle: `${row.name} in Lebanon`,
    seoDescription: `${row.name} products available from RF Telecom LB in Lebanon.`,
    displayOrder,
  });
}

function makeSubcategory(row: Subcategory, parent: CatalogCategory, displayOrder = 0): CatalogCategory {
  const slug = row.collection_handle || row.slug || slugify(row.name);

  return withDatabaseTaxonomy({
    id: row.id,
    name: row.name,
    slug,
    collectionHandle: slug,
    fullPath: `${parent.name} > ${row.name}`,
    depth: 1,
    parentId: parent.id,
    parent: { ...parent, children: undefined, parent: undefined },
    children: [],
    description: `${row.name} products in ${parent.name} available from RF Telecom LB in Lebanon.`,
    seoTitle: `${row.name} in Lebanon`,
    seoDescription: `${row.name} products in ${parent.name} available from RF Telecom LB in Lebanon.`,
    displayOrder,
  }, findDatabaseCategory(parent.categoryId) || findDatabaseCategory(parent.id) || findDatabaseCategory(parent.slug));
}

function makePrismaCategory(row: PrismaCategoryRow, children: CatalogCategory[] = []): CatalogCategory {
  return withDatabaseTaxonomy({
    id: row.id,
    name: row.name,
    slug: row.slug,
    collectionHandle: row.parentId ? row.slug : null,
    fullPath: row.parent ? `${row.parent.name} > ${row.name}` : row.name,
    depth: row.parentId ? 1 : 0,
    parentId: row.parentId,
    parent: row.parent ? makePrismaCategory({ ...row.parent, parent: null }, []) : null,
    children,
    description: row.description,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    displayOrder: row.displayOrder,
  }, row.parent ? findDatabaseCategory(row.parent.slug) || findDatabaseCategory(row.parent.name) : undefined);
}

function mapPrismaProduct(row: PrismaProductRow): CatalogProduct {
  const category = row.category ? makePrismaCategory(row.category) : null;
  const subcategory = row.subcategory
    ? makePrismaCategory({ ...row.subcategory, parent: row.category || row.subcategory.parent || null })
    : null;
  const specifications =
    row.specifications && typeof row.specifications === "object" && !Array.isArray(row.specifications)
      ? (row.specifications as Record<string, string>)
      : {};

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    productUrl: `/products/${row.slug}`,
    product_url: `/products/${row.slug}`,
    category,
    subcategory,
    collectionHandle: subcategory?.slug || null,
    collection: category?.name || null,
    collectionSlug: subcategory?.slug || category?.slug || null,
    brand: row.brand
      ? {
          id: row.brand.id,
          name: row.brand.name,
          slug: row.brand.slug,
          description: row.brand.description,
          displayOrder: row.brand.displayOrder,
          seoTitle: row.brand.seoTitle,
          seoDescription: row.brand.seoDescription,
        }
      : null,
    sku: row.sku,
    shortDescription: row.shortDescription,
    fullDescription: row.fullDescription,
    specifications,
    price: row.price === null || row.price === undefined ? null : Number(row.price),
    compareAtPrice: null,
    currency: row.currency,
    availability: row.availability,
    images: (row.images || []).map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      position: image.position,
    })),
    featured: row.featured,
    published: row.published,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    metaKeywords: row.metaKeywords,
    imageAltText: row.imageAltText,
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
  };
}

function mapCatalogProduct(row: ProductCatalogItem): CatalogProduct {
  const category = makeCategory({ id: row.category_id, name: row.category });
  const subcategory = makeSubcategory(
    {
      id: row.subcategory_id,
      category_id: row.category_id,
      name: row.sub_category,
      collection_handle: row.collection_handle,
      created_at: row.created_at,
    },
    category,
  );

  return {
    id: row.product_id,
    name: row.product_name,
    slug: slugify(row.product_name || row.product_id),
    productUrl: row.product_url,
    product_url: row.product_url,
    category,
    subcategory,
    collectionHandle: row.collection_handle,
    collection: row.category,
    collectionSlug: row.collection_handle,
    brand: null,
    sku: null,
    shortDescription: null,
    fullDescription: null,
    specifications: {
      Category: row.category,
      Subcategory: row.sub_category,
      Collection: row.collection_handle,
    },
    price: null,
    compareAtPrice: null,
    currency: "USD",
    availability: "ON_REQUEST",
    images: [],
    featured: false,
    published: true,
    metaTitle: `${row.product_name} | RF Telecom LB`,
    metaDescription: `${row.product_name} in ${row.sub_category}, ${row.category}.`,
    imageAltText: row.product_name,
    createdAt: row.created_at,
    updatedAt: row.created_at,
  };
}

function firstRelation<T>(relation: T | T[] | null | undefined) {
  return Array.isArray(relation) ? relation[0] : relation;
}

function cleanSupabaseSubcategoryName(name: string) {
  const parts = name.split("_");
  return parts.length > 1 ? parts.slice(1).join("_").trim() : name;
}

function mapSupabaseProduct(row: SupabaseProductRow): CatalogProduct {
  const productSubcategory = row.product_subcategories?.[0] || null;
  const subcategoryRow = firstRelation(productSubcategory?.subcategories);
  const categoryRow = firstRelation(subcategoryRow?.categories);
  const categoryId = String(categoryRow?.id || subcategoryRow?.category_id || "");
  const subcategoryId =
    productSubcategory?.subcategory_id === null || productSubcategory?.subcategory_id === undefined
      ? ""
      : String(productSubcategory.subcategory_id);
  const categoryName = categoryRow?.name || "Uncategorized";
  const subcategoryName = cleanSupabaseSubcategoryName(subcategoryRow?.name || "Uncategorized");
  const category = makeCategory({ id: categoryId, name: categoryName });
  const subcategory = makeSubcategory(
    {
      id: subcategoryId,
      category_id: categoryId,
      name: subcategoryName,
      collection_handle: slugify(subcategoryName),
      created_at: row.created_at,
    },
    category,
  );
  const slug = row.slug || slugify(row.title || row.id);
  const specifications: Record<string, string> = row.spec_pdf_url ? { "Spec sheet": row.spec_pdf_url } : {};
  const brandRow = firstRelation(row.brands);
  const brand = brandRow
    ? {
        id: String(brandRow.id),
        name: brandRow.name,
        slug: brandRow.slug,
        description: brandRow.description || null,
      }
    : null;

  return {
    id: row.id,
    name: row.title,
    slug,
    productUrl: `/products/${slug}`,
    product_url: `/products/${slug}`,
    category,
    subcategory,
    collectionHandle: subcategory.slug,
    collection: category.name,
    collectionSlug: subcategory.slug,
    brand,
    sku: row.sku,
    shortDescription: null,
    fullDescription: row.description,
    specifications,
    price: row.price,
    compareAtPrice: null,
    currency: "USD",
    availability: row.status === "active" ? "IN_STOCK" : "ON_REQUEST",
    images: (row.product_images || [])
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .map((image) => ({
        id: image.id,
        url: image.url,
        alt: row.title,
        position: image.position || 0,
      })),
    featured: false,
    published: row.status === "active",
    metaTitle: row.title,
    metaDescription: row.description,
    metaKeywords: null,
    imageAltText: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  };
}

function applySupabaseSubcategoryContext(
  products: CatalogProduct[],
  mapping: ReturnType<typeof findDatabaseSubcategory>,
) {
  if (!mapping) {
    return products;
  }

  const category: CatalogCategory = {
    id: mapping.category.categoryId,
    name: mapping.category.name,
    slug: mapping.category.slug,
    categoryId: mapping.category.categoryId,
    subcategoryId: null,
    collectionHandle: null,
    fullPath: mapping.category.name,
    depth: 0,
    parentId: null,
    children: [],
    description: `${mapping.category.name} products available from RF Telecom LB in Lebanon.`,
    seoTitle: `${mapping.category.name} in Lebanon`,
    seoDescription: `${mapping.category.name} products available from RF Telecom LB in Lebanon.`,
  };
  const subcategory: CatalogCategory = {
    id: mapping.subcategory.subcategoryId,
    name: mapping.subcategory.name,
    slug: mapping.subcategory.slug,
    categoryId: mapping.category.categoryId,
    subcategoryId: mapping.subcategory.subcategoryId,
    collectionHandle: mapping.subcategory.slug,
    fullPath: `${mapping.category.name} > ${mapping.subcategory.name}`,
    depth: 1,
    parentId: category.id,
    parent: { ...category, children: undefined },
    children: [],
    description: `${mapping.subcategory.name} products in ${mapping.category.name} available from RF Telecom LB in Lebanon.`,
    seoTitle: `${mapping.subcategory.name} in Lebanon`,
    seoDescription: `${mapping.subcategory.name} products in ${mapping.category.name} available from RF Telecom LB in Lebanon.`,
  };

  return products.map((product) => ({
    ...product,
    category,
    subcategory,
    collection: category.name,
    collectionHandle: subcategory.collectionHandle,
    collectionSlug: subcategory.slug,
    specifications: {
      ...product.specifications,
      Category: category.name,
      Subcategory: subcategory.name,
    },
  }));
}

function applySupabaseTitleSubcategoryOverride(
  products: CatalogProduct[],
  mapping: ReturnType<typeof findDatabaseSubcategory>,
  terms: string[],
) {
  const normalizedTerms = terms.map((term) => term.toLowerCase());
  return applySupabaseSubcategoryContext(
    products.filter((product) => normalizedTerms.some((term) => product.name.toLowerCase().includes(term))),
    mapping,
  );
}

function rowMatchesCategory(row: ProductCatalogItem, value?: string) {
  if (!value) {
    return true;
  }

  const mapping = findDatabaseCategory(value);
  if (mapping) {
    return (
      row.category_id === mapping.categoryId ||
      matchesTaxonomyValue(row.category, categoryMappingKeys(mapping))
    );
  }

  return slugify(row.category) === value || row.category_id === value;
}

function rowMatchesSubcategory(row: ProductCatalogItem, value?: string) {
  if (!value) {
    return true;
  }

  const mapping = findDatabaseSubcategory(value);
  if (mapping) {
    return (
      row.category_id === mapping.category.categoryId &&
      (row.subcategory_id === mapping.subcategory.subcategoryId ||
        row.collection_handle === mapping.subcategory.slug ||
        matchesTaxonomyValue(row.sub_category, subcategoryMappingKeys(mapping.subcategory)))
    );
  }

  return row.collection_handle === value || slugify(row.sub_category) === value || row.subcategory_id === value;
}

async function fetchAllCatalogRows() {
  const supabase = getSupabaseCatalogClient();

  if (!supabase) {
    catalogError("Supabase catalog client is not configured.");
    return [];
  }

  const pageSize = 1000;
  const rows: ProductCatalogItem[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("product_catalog_view")
      .select("*")
      .order("category", { ascending: true })
      .order("sub_category", { ascending: true })
      .order("product_name", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      catalogError("Failed to load products from product_catalog_view.", error);
      return [];
    }

    rows.push(...((data || []) as ProductCatalogItem[]));

    if (!data || data.length < pageSize) {
      break;
    }
  }

  return rows;
}

async function fetchSupabaseProducts(options: ProductListOptions = {}) {
  const supabase = getSupabaseCatalogClient();

  if (!supabase) {
    catalogError("Supabase catalog client is not configured.");
    return [];
  }

  let productIds: string[] | null = null;
  const categoryMapping = findDatabaseCategory(options.categoryId || options.categorySlug);
  const subcategoryMapping = findDatabaseSubcategory(options.subcategoryId || options.subcategorySlug || options.collectionSlug);
  const subcategoryLookup = options.subcategoryId || options.subcategorySlug || options.collectionSlug || null;
  const legacySubcategoryId = subcategoryMapping?.subcategory.subcategoryId || null;
  const titleOverrideTerms = legacySubcategoryId ? SUPABASE_TITLE_FILTER_SUBCATEGORIES[legacySubcategoryId] : null;

  if (subcategoryLookup && !titleOverrideTerms) {
    const lookupSlugs = [
      subcategoryLookup,
      ...subcategorySlugLookupValues(subcategoryLookup),
    ].filter((value, index, values) => value && values.indexOf(value) === index);

    const { data: subcategoryRows, error: subcategoryError } = await supabase
      .from("subcategories")
      .select("id,slug")
      .or(`id.eq.${subcategoryLookup},slug.in.(${lookupSlugs.join(",")})`);

    if (subcategoryError) {
      catalogError("Failed to resolve Supabase subcategory.", subcategoryError);
      return [];
    }

    const subcategoryIds = (subcategoryRows || []).map((subcategory) => String(subcategory.id));

    if (!subcategoryIds.length) {
      return [];
    }

    const { data: productLinks, error: productLinksError } = await supabase
      .from("product_subcategories")
      .select("product_id")
      .in("subcategory_id", subcategoryIds);

    if (productLinksError) {
      catalogError("Failed to load product subcategory links.", productLinksError);
      return [];
    }

    productIds = (productLinks || []).map((link) => link.product_id as string);

    if (!productIds.length) {
      return [];
    }
  }

  let query = supabase
    .from("products")
    .select(
      "id,title,slug,description,price,brand_id,sku,status,spec_pdf_url,created_at,updated_at,brands(id,name,slug,description),product_subcategories(subcategory_id,subcategories(id,name,category_id,categories(id,name))),product_images(id,url,position)",
    )
    .eq("status", "active");

  if (productIds) {
    query = query.in("id", productIds);
  }

  if (options.brandSlug) {
    query = query.eq("brands.slug", options.brandSlug);
  }

  if (options.sort === "name-az") {
    query = query.order("title", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    catalogError("Failed to load products from Supabase products.", error);
    return [];
  }

  let products = ((data || []) as SupabaseProductRow[]).map(mapSupabaseProduct);

  if (titleOverrideTerms) {
    products = applySupabaseTitleSubcategoryOverride(products, subcategoryMapping, titleOverrideTerms);
  } else if (subcategoryLookup && subcategoryMapping) {
    products = applySupabaseSubcategoryContext(products, subcategoryMapping);
  }

  if (!titleOverrideTerms && categoryMapping) {
    products = products.filter((product) => product.category?.categoryId === categoryMapping.categoryId);
  } else if (!titleOverrideTerms && options.categoryId) {
    products = products.filter((product) => product.category?.categoryId === options.categoryId);
  }

  if (options.collectionSlug && !subcategoryMapping) {
    products = products.filter(
      (product) =>
        product.collectionHandle === options.collectionSlug ||
        product.subcategory?.slug === options.collectionSlug ||
        product.category?.slug === options.collectionSlug,
    );
  }

  if (options.subcategorySearch) {
    const term = options.subcategorySearch.toLowerCase();
    products = products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category?.name.toLowerCase().includes(term) ||
        product.subcategory?.name.toLowerCase().includes(term),
    );
  }

  if (options.search) {
    const term = options.search.toLowerCase();
    products = products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.sku?.toLowerCase().includes(term) ||
        product.category?.name.toLowerCase().includes(term) ||
        product.subcategory?.name.toLowerCase().includes(term),
    );
  }

  if (options.brandSlug) {
    products = products.filter((product) => product.brand?.slug === options.brandSlug);
  }

  if (options.sort && options.sort !== "name-az") {
    products = products.sort(
      (a, b) =>
        (a.category?.name || "").localeCompare(b.category?.name || "") ||
        (a.subcategory?.name || "").localeCompare(b.subcategory?.name || "") ||
        a.name.localeCompare(b.name),
    );
  }

  return options.take ? products.slice(0, options.take) : products;
}

async function fetchSupabaseBrands() {
  const supabase = getSupabaseCatalogClient();

  if (!supabase) {
    catalogError("Supabase catalog client is not configured.");
    return [];
  }

  const { data, error } = await supabase
    .from("brands")
    .select("id,name,slug,description,featured")
    .order("name", { ascending: true });

  if (error) {
    catalogError("Failed to load brands from Supabase brands.", error);
    return [];
  }

  return ((data || []) as SupabaseBrandRow[]).map((brand, index) => ({
    id: String(brand.id),
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    displayOrder: index + 1,
    seoTitle: `${brand.name} Products in Lebanon`,
    seoDescription: `${brand.name} products available from RF Telecom LB.`,
  }));
}

async function fetchCategories() {
  const supabase = getSupabaseCatalogClient();

  if (!supabase) {
    catalogError("Supabase catalog client is not configured.");
    return [];
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, created_at")
    .order("name", { ascending: true });

  if (error) {
    catalogError("Failed to load categories.", error);
    return [];
  }

  return (data || []) as Category[];
}

async function fetchSubcategories(categoryId?: string) {
  const supabase = getSupabaseCatalogClient();

  if (!supabase) {
    catalogError("Supabase catalog client is not configured.");
    return [];
  }

  let query = supabase
    .from("subcategories")
    .select("id, name, slug, category_id, created_at")
    .order("name", { ascending: true });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;

  if (error) {
    catalogError("Failed to load subcategories.", error);
    return [];
  }

  return ((data || []) as Array<Omit<Subcategory, "collection_handle">>).map((subcategory) => ({
    ...subcategory,
    collection_handle: subcategory.slug || slugify(subcategory.name),
  }));
}

function filterRows(rows: ProductCatalogItem[], options: ProductListOptions) {
  let filtered = rows;
  const search = normalizeSearch(options.search);
  const subcategorySearch = normalizeSearch(options.subcategorySearch);

  if (options.categorySlug) {
    filtered = filtered.filter((row) => rowMatchesCategory(row, options.categorySlug));
  }

  if (options.categoryId) {
    filtered = filtered.filter((row) => rowMatchesCategory(row, options.categoryId));
  }

  if (options.subcategorySlug) {
    filtered = filtered.filter((row) => rowMatchesSubcategory(row, options.subcategorySlug));
  }

  if (options.subcategoryId) {
    filtered = filtered.filter((row) => rowMatchesSubcategory(row, options.subcategoryId));
  }

  if (options.collectionSlug) {
    filtered = filtered.filter(
      (row) =>
        row.collection_handle === options.collectionSlug ||
        slugify(row.category) === options.collectionSlug ||
        slugify(row.sub_category) === options.collectionSlug,
    );
  }

  if (subcategorySearch) {
    const term = subcategorySearch.toLowerCase();
    filtered = filtered.filter(
      (row) =>
        row.sub_category.toLowerCase().includes(term) ||
        row.product_name.toLowerCase().includes(term) ||
        row.category.toLowerCase().includes(term),
    );
  }

  if (options.brandSlug) {
    const brand = slugToBrand(options.brandSlug);
    if (brand) {
      filtered = filtered.filter((row) => productMatchesBrandName(row.product_name, brand));
    }
  }

  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (row) =>
        row.product_name.toLowerCase().includes(term) ||
        row.category.toLowerCase().includes(term) ||
        row.sub_category.toLowerCase().includes(term) ||
        row.collection_handle.toLowerCase().includes(term),
    );
  }

  if (options.sort === "name-az") {
    filtered = [...filtered].sort((a, b) => a.product_name.localeCompare(b.product_name));
  } else {
    filtered = [...filtered].sort(
      (a, b) =>
        a.category.localeCompare(b.category) ||
        a.sub_category.localeCompare(b.sub_category) ||
        a.product_name.localeCompare(b.product_name),
    );
  }

  return options.take ? filtered.slice(0, options.take) : filtered;
}

async function getPrismaCategories() {
  const rows = await prisma.category.findMany({
    include: { parent: true },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });

  if (!rows.length) {
    return [];
  }

  const parents = rows.filter((row) => !row.parentId);
  const childrenByParent = new Map<string, CatalogCategory[]>();

  for (const row of rows.filter((item) => item.parentId)) {
    const parent = rows.find((item) => item.id === row.parentId);
    const child = makePrismaCategory({ ...row, parent });
    childrenByParent.set(row.parentId!, [...(childrenByParent.get(row.parentId!) || []), child]);
  }

  return parents
    .map((parent) =>
      makePrismaCategory(
        parent,
        [...(childrenByParent.get(parent.id) || [])].sort(
          (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || a.name.localeCompare(b.name),
        ),
      ),
    )
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || a.name.localeCompare(b.name));
}

function buildPrismaProductWhere(options: ProductListOptions = {}) {
  const search = normalizeSearch(options.search);
  const subcategorySearch = normalizeSearch(options.subcategorySearch);
  const where: Record<string, unknown> = {
    published: true,
  };
  const and: Record<string, unknown>[] = [];

  if (options.featured !== undefined) {
    where.featured = options.featured;
  }

  const categoryLookup = [
    ...categorySlugLookupValues(options.categorySlug),
    ...categorySlugLookupValues(options.categoryId),
  ].filter((value, index, values) => value && values.indexOf(value) === index);
  const subcategoryLookup = [
    ...subcategorySlugLookupValues(options.subcategorySlug),
    ...subcategorySlugLookupValues(options.subcategoryId),
  ].filter((value, index, values) => value && values.indexOf(value) === index);

  if (categoryLookup.length) {
    and.push({
      OR: [
        ...(options.categoryId ? [{ categoryId: options.categoryId }, { category: { id: options.categoryId } }] : []),
        ...categoryLookup.map((slug) => ({ category: { slug } })),
      ],
    });
  }

  if (subcategoryLookup.length) {
    and.push({
      OR: [
        ...(options.subcategoryId
          ? [{ subcategoryId: options.subcategoryId }, { subcategory: { id: options.subcategoryId } }]
          : []),
        ...subcategoryLookup.map((slug) => ({ subcategory: { slug } })),
      ],
    });
  }

  if (options.collectionSlug) {
    and.push({
      OR: [
        { subcategory: { slug: options.collectionSlug } },
        { subcategoryId: options.collectionSlug },
      ],
    });
  }

  if (options.brandSlug) {
    and.push({ brand: { slug: options.brandSlug } });
  }

  if (options.minPrice || options.maxPrice) {
    and.push({
      price: {
        ...(options.minPrice ? { gte: Number(options.minPrice) } : {}),
        ...(options.maxPrice ? { lte: Number(options.maxPrice) } : {}),
      },
    });
  }

  if (subcategorySearch) {
    and.push({
      OR: [
        { name: { contains: subcategorySearch, mode: "insensitive" } },
        { subcategory: { name: { contains: subcategorySearch, mode: "insensitive" } } },
        { category: { name: { contains: subcategorySearch, mode: "insensitive" } } },
      ],
    });
  }

  if (search) {
    and.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { category: { name: { contains: search, mode: "insensitive" } } },
        { subcategory: { name: { contains: search, mode: "insensitive" } } },
        { subcategory: { slug: { contains: search, mode: "insensitive" } } },
      ],
    });
  }

  if (and.length) {
    where.AND = and;
  }

  return where;
}

async function getPrismaProducts(options: ProductListOptions = {}) {
  const products = await prisma.product.findMany({
    where: buildPrismaProductWhere(options),
    include: {
      brand: true,
      category: true,
      subcategory: { include: { parent: true } },
      images: { orderBy: { position: "asc" } },
    },
    orderBy: options.sort === "name-az" ? [{ name: "asc" }] : [{ createdAt: "desc" }],
    take: options.take,
  });

  if (!products.length) {
    return [];
  }

  const mapped = products.map(mapPrismaProduct);

  if (options.sort && options.sort !== "name-az") {
    return mapped.sort(
      (a, b) =>
        (a.category?.name || "").localeCompare(b.category?.name || "") ||
        (a.subcategory?.name || "").localeCompare(b.subcategory?.name || "") ||
        a.name.localeCompare(b.name),
    );
  }

  return mapped;
}

export async function getProducts(options: ProductListOptions = {}) {
  if (await hasPrismaProducts()) {
    return getPrismaProducts(options);
  }

  const supabaseProducts = await fetchSupabaseProducts(options);
  if (supabaseProducts.length) {
    return supabaseProducts;
  }

  if (options.subcategoryId || options.subcategorySlug || options.collectionSlug) {
    return [];
  }

  const rows = await fetchAllCatalogRows();
  const catalogProducts = filterRows(rows, options).map(mapCatalogProduct);
  return catalogProducts.length ? catalogProducts : getStaticProducts(options);
}

export async function searchCatalog(query: string, take?: number) {
  const term = sanitizeLikeTerm(normalizeSearch(query));

  if (!term) {
    return [];
  }

  if (await hasPrismaProducts()) {
    return getPrismaProducts({ search: term, take });
  }

  const supabaseProducts = await fetchSupabaseProducts({ search: term, take });
  if (supabaseProducts.length) {
    return supabaseProducts;
  }

  const supabase = getSupabaseCatalogClient();

  if (!supabase) {
    return getProducts({ search: term, take });
  }

  let request = supabase
    .from("product_catalog_view")
    .select("*")
    .or(`product_name.ilike.%${term}%,category.ilike.%${term}%,sub_category.ilike.%${term}%`)
    .order("category", { ascending: true })
    .order("sub_category", { ascending: true })
    .order("product_name", { ascending: true });

  if (take) {
    request = request.limit(take);
  }

  const { data, error } = await request;

  if (error) {
    catalogError("Failed to search product_catalog_view.", error);
    return getStaticProducts({ search: term, take });
  }

  const products = ((data || []) as ProductCatalogItem[]).map(mapCatalogProduct);
  return products.length ? products : getStaticProducts({ search: term, take });
}

export async function getCategories() {
  const [categories, subcategories] = await Promise.all([fetchCategories(), fetchSubcategories()]);

  if (categories.length) {
    const byId = new Map(categories.map((category, index) => [String(category.id), makeCategory({ ...category, id: String(category.id) }, index + 1)]));

    for (const [index, subcategory] of subcategories.entries()) {
      const parent = byId.get(String(subcategory.category_id));
      if (!parent) {
        continue;
      }

      parent.children = sortSubcategoriesForMenu([
        ...(parent.children || []),
        makeSubcategory(subcategory, parent, index + 1),
      ]);
    }

    const mappedCategories = sortCategoriesForMenu([...byId.values()]);
    if (mappedCategories.length) {
      return mappedCategories;
    }
  }

  if (await hasPrismaCategories()) {
    return getPrismaCategories();
  }

  return getStaticCategories();
}

export async function getAllCategoriesFlat() {
  const categories = await getCategories();
  return categories.flatMap((category): CatalogCategory[] => [category, ...(category.children || [])]);
}

export async function getCategoryBySlug(slug: string) {
  if (await hasPrismaCategories()) {
    const lookupSlugs = [
      ...categorySlugLookupValues(slug),
      ...subcategorySlugLookupValues(slug),
    ].filter((value, index, values) => value && values.indexOf(value) === index);
    const category = await prisma.category.findFirst({
      where: { OR: lookupSlugs.map((item) => ({ slug: item })) },
      include: { parent: true },
    });

    if (!category) {
      return null;
    }

    const children = await prisma.category.findMany({
      where: { parentId: category.id },
      include: { parent: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });

    return makePrismaCategory(category, children.map((child) => makePrismaCategory(child)));
  }

  const categories = await getCategories();
  const lookupSlugs = [
    ...categorySlugLookupValues(slug),
    ...subcategorySlugLookupValues(slug),
  ].filter((value, index, values) => value && values.indexOf(value) === index);
  for (const category of categories) {
    if (lookupSlugs.includes(category.slug)) {
      return category;
    }

    const subcategory = category.children?.find((child) => lookupSlugs.includes(child.slug));
    if (subcategory) {
      return subcategory;
    }
  }

  return null;
}

export async function getSubcategoryByHandle(collectionHandle: string) {
  if (await hasPrismaCategories()) {
    const lookupSlugs = subcategorySlugLookupValues(collectionHandle);
    const subcategory = await prisma.category.findFirst({
      where: {
        parentId: { not: null },
        OR: [...lookupSlugs.map((slug) => ({ slug })), { id: collectionHandle }],
      },
      include: { parent: true },
    });

    return subcategory ? makePrismaCategory(subcategory) : null;
  }

  const categories = await getCategories();
  const lookupSlugs = subcategorySlugLookupValues(collectionHandle);

  for (const category of categories) {
    const subcategory = category.children?.find(
      (child) =>
        child.subcategoryId === collectionHandle ||
        child.collectionHandle === collectionHandle ||
        lookupSlugs.includes(child.slug),
    );
    if (subcategory) {
      return subcategory;
    }
  }

  return null;
}

export async function getProductsByCollection(collectionHandle: string) {
  if (await hasPrismaProducts()) {
    return getPrismaProducts({ collectionSlug: collectionHandle, subcategoryId: collectionHandle });
  }

  const supabaseProducts = await fetchSupabaseProducts({
    collectionSlug: collectionHandle,
    subcategoryId: collectionHandle,
  });
  if (supabaseProducts.length) {
    return supabaseProducts;
  }

  const supabase = getSupabaseCatalogClient();

  if (!supabase) {
    return getProducts({ collectionSlug: collectionHandle });
  }

  const mappedSubcategory = findDatabaseSubcategory(collectionHandle);
  const request = supabase
    .from("product_catalog_view")
    .select("*")
    .order("product_name", { ascending: true });
  const { data, error } = await (
    mappedSubcategory
      ? request
          .eq("category_id", mappedSubcategory.category.categoryId)
          .eq("subcategory_id", mappedSubcategory.subcategory.subcategoryId)
      : request.eq("collection_handle", collectionHandle)
  );

  if (error) {
    catalogError(`Failed to load products for collection ${collectionHandle}.`, error);
    return getStaticProducts({ collectionSlug: collectionHandle });
  }

  const products = ((data || []) as ProductCatalogItem[]).map(mapCatalogProduct);
  return products.length ? products : getStaticProducts({ collectionSlug: collectionHandle });
}

export async function getProductBySlug(slug: string) {
  const decoded = decodeURIComponent(slug);
  if (await hasPrismaProducts()) {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug }, { id: decoded }],
        published: true,
      },
      include: {
        brand: true,
        category: true,
        subcategory: { include: { parent: true } },
        images: { orderBy: { position: "asc" } },
      },
    });

    return product ? mapPrismaProduct(product) : null;
  }

  if (await hasAnyPrismaCatalogData()) {
    const products = await fetchSupabaseProducts();
    return (
      products.find((product) => product.slug === slug) ||
      products.find((product) => product.id === decoded) ||
      products.find((product) => product.productUrl === decoded) ||
      null
    );
  }

  const products = await getProducts();

  return (
    products.find((product) => product.slug === slug) ||
    products.find((product) => product.id === decoded) ||
    products.find((product) => product.productUrl === decoded) ||
    null
  );
}

export async function getProductOrCategoryBySlug(slug: string) {
  const category = await getCategoryBySlug(slug);

  if (category) {
    return { type: "category" as const, category };
  }

  const product = await getProductBySlug(slug);

  if (product) {
    return { type: "product" as const, product };
  }

  return null;
}

export async function getRelatedProducts(product: CatalogProduct) {
  const products = await getProducts({
    collectionSlug: product.collectionHandle || product.subcategory?.collectionHandle || undefined,
    take: 5,
  });

  return products.filter((item) => item.id !== product.id).slice(0, 4);
}

export async function getCollections(): Promise<CatalogCollection[]> {
  const categories = await getCategories();
  if (await hasPrismaCategories()) {
    const productCounts = await prisma.product.groupBy({
      by: ["subcategoryId"],
      where: { published: true, subcategoryId: { not: null } },
      _count: { _all: true },
    });
    const prismaCounts = new Map(productCounts.map((item) => [item.subcategoryId, item._count._all]));

    return categories.flatMap((category) =>
      (category.children || []).map((subcategory, index) => ({
        name: subcategory.name,
        slug: subcategory.collectionHandle || subcategory.slug,
        count: prismaCounts.get(subcategory.id) || 0,
        displayOrder: index + 1,
      })),
    );
  }

  const rows = await fetchAllCatalogRows();
  const counts = new Map<string, number>();

  for (const row of rows) {
    counts.set(row.collection_handle, (counts.get(row.collection_handle) || 0) + 1);
  }

  return categories.flatMap((category) =>
    (category.children || []).map((subcategory, index) => ({
      name: subcategory.name,
      slug: subcategory.collectionHandle || subcategory.slug,
      count: counts.get(subcategory.collectionHandle || subcategory.slug) || 0,
      displayOrder: index + 1,
    })),
  );
}

export async function getBrands(): Promise<CatalogBrand[]> {
  const supabaseBrands = await fetchSupabaseBrands();
  if (supabaseBrands.length) {
    return supabaseBrands;
  }

  if (await hasPrismaBrands()) {
    const brands = await prisma.brand.findMany({ orderBy: [{ displayOrder: "asc" }, { name: "asc" }] });
    return brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      displayOrder: brand.displayOrder,
      seoTitle: brand.seoTitle,
      seoDescription: brand.seoDescription,
    }));
  }

  const rows = await fetchAllCatalogRows();
  if (!rows.length) {
    return getStaticBrands();
  }

  const brands = BRANDS.filter((brand) => rows.some((row) => productMatchesBrandName(row.product_name, brand))).map(
    (brand, index) => ({
      id: brandToSlug(brand),
      name: brand,
      slug: brandToSlug(brand),
      displayOrder: index + 1,
      description: `${brand} products available from RF Telecom LB in Lebanon.`,
      seoTitle: `${brand} Products in Lebanon`,
      seoDescription: `${brand} products available from RF Telecom LB.`,
    }),
  );

  return brands.length ? brands : getStaticBrands();
}

export async function getBrandBySlug(slug: string): Promise<CatalogBrand | null> {
  const supabaseBrand = (await fetchSupabaseBrands()).find((brand) => brand.slug === slug);
  if (supabaseBrand) {
    return supabaseBrand;
  }

  if (await hasPrismaBrands()) {
    const brandRecord = await prisma.brand.findUnique({ where: { slug } });
    return brandRecord
      ? {
          id: brandRecord.id,
          name: brandRecord.name,
          slug: brandRecord.slug,
          description: brandRecord.description,
          displayOrder: brandRecord.displayOrder,
          seoTitle: brandRecord.seoTitle,
          seoDescription: brandRecord.seoDescription,
        }
      : null;
  }

  const brand = slugToBrand(slug);

  if (!brand) {
    return null;
  }

  return {
    id: brandToSlug(brand),
    name: brand,
    slug: brandToSlug(brand),
    description: `${brand} products available from RF Telecom LB in Lebanon.`,
    seoTitle: `${brand} Products in Lebanon`,
    seoDescription: `${brand} products available from RF Telecom LB.`,
  };
}

export async function getProductsByBrandSlug(slug: string) {
  if (await hasPrismaProducts()) {
    return getPrismaProducts({ brandSlug: slug });
  }

  const supabaseProducts = await fetchSupabaseProducts({ brandSlug: slug });
  if (supabaseProducts.length) {
    return supabaseProducts;
  }

  if (await hasAnyPrismaCatalogData()) {
    return [];
  }

  const brand = slugToBrand(slug);
  if (!brand) {
    return [];
  }

  return getStaticProducts({ brandSlug: slug });
}

export async function getCategoryAndDescendantIds(slug: string) {
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return null;
  }

  return [category.id, ...(category.children || []).map((child) => child.id)];
}

export async function getProductSeoSlugs() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return {
    products: products.map((product) => ({ slug: product.slug, updatedAt: new Date(product.updatedAt || Date.now()) })),
    categories: categories.map((category) => ({ slug: category.slug, updatedAt: new Date() })),
    brands: (await getBrands()).map((brand) => ({ slug: brand.slug, updatedAt: new Date() })),
    collections: categories.flatMap((category) =>
      (category.children || []).map((subcategory) => ({
        slug: subcategory.collectionHandle || subcategory.slug,
        updatedAt: new Date(),
      })),
    ),
  };
}

export function categoryDescription(category: CatalogCategory) {
  return category.description || `${category.name} products available from RF Telecom LB in Lebanon.`;
}

export function brandDescription(brand: CatalogBrand) {
  return brand.description || `${brand.name} products available from RF Telecom LB in Lebanon.`;
}

export function productDescription(product: CatalogProduct) {
  return product.metaDescription || product.shortDescription || product.fullDescription || SITE_DESCRIPTION;
}

export function makeUniqueSlug(base: string, fallback: string) {
  return slugify(base || fallback);
}
