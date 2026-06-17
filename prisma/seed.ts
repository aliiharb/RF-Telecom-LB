import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { slugify } from "../lib/site";

const brands = [
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

const categoryTree = [
  {
    name: "Telecom & Phones",
    children: [
      "Accessories",
      "Analog and IP Corded Phone",
      "Analog and IP Cordless Phone",
      "Analog PBAX",
      "VOIP and IP Systems",
      "Switch POE",
      "Router",
      "Interphone",
      "Others",
    ],
  },
  {
    name: "Connectors",
    children: ["All Connectors", "BNC", "F Type", "N Type", "PL", "RCA", "SMA", "TNC"],
  },
  {
    name: "Cables",
    children: [
      "Crimping Tools",
      "Fiber Optic Cables",
      "HDMI Cables",
      "Network Cables",
      "Network Cables Accessories",
      "Power Cables",
      "RF Cables",
      "Telephone Cables",
      "Telephone Cable Accessories",
      "VGA Cables",
    ],
  },
  {
    name: "Security",
    children: [
      "CCTV",
      "Door Lock",
      "Door Viewer",
      "Remote and Receiver",
      "Signal Blocking",
      "Spy Camera",
      "Voice Recorder",
    ],
  },
  {
    name: "Testing and Measurement Tools",
    children: ["Thermostat and AC Control", "Liquid Level Meter", "Cable Testing", "UNI-T", "Solar Testing"],
  },
  {
    name: "Electric Equipment",
    children: [
      "Adapters",
      "AEG Lamp",
      "Backup",
      "Delta Stabilizers",
      "Electrics",
      "Metas Stabilizers",
      "Power Supply",
      "Solar Inverters",
    ],
  },
  {
    name: "Electronics",
    children: ["Batteries", "Converters", "Solar Batteries"],
  },
];

async function seedAdmin() {
  const legacyPassword = process.env.ADMIN_PASSWORD || "admin";
  const adminAccounts = [
    {
      email: process.env.ADMIN_EMAIL || "admin@rftelecomlb.com",
      password: legacyPassword,
      passwordHash: process.env.ADMIN_PASSWORD_HASH || "",
    },
    {
      email: process.env.ADMIN_ALI_EMAIL || "ali@rftelecomlb.com",
      password: process.env.ADMIN_ALI_PASSWORD || legacyPassword,
      passwordHash: process.env.ADMIN_ALI_PASSWORD_HASH || "",
    },
    {
      email: process.env.ADMIN_ZAHRAA_EMAIL || "zahraa@rftelecomlb.com",
      password: process.env.ADMIN_ZAHRAA_PASSWORD || legacyPassword,
      passwordHash: process.env.ADMIN_ZAHRAA_PASSWORD_HASH || "",
    },
  ];

  for (const account of adminAccounts) {
    const email = account.email.trim().toLowerCase();
    const passwordHash = account.passwordHash || (await bcrypt.hash(account.password, 12));

    await prisma.user.upsert({
      where: { email },
      update: { passwordHash, role: "ADMIN" },
      create: { email, passwordHash, role: "ADMIN" },
    });
  }
}

async function seedBrands() {
  for (const [index, name] of brands.entries()) {
    await prisma.brand.upsert({
      where: { slug: slugify(name) },
      update: {
        name,
        displayOrder: index + 1,
        description: `${name} products available from RF Telecom LB in Lebanon.`,
        seoTitle: `${name} Products in Lebanon`,
        seoDescription: `${name} products available from RF Telecom LB.`,
      },
      create: {
        name,
        slug: slugify(name),
        displayOrder: index + 1,
        description: `${name} products available from RF Telecom LB in Lebanon.`,
        seoTitle: `${name} Products in Lebanon`,
        seoDescription: `${name} products available from RF Telecom LB.`,
      },
    });
  }
}

async function seedCategories() {
  for (const [categoryIndex, category] of categoryTree.entries()) {
    const parent = await prisma.category.upsert({
      where: { slug: slugify(category.name) },
      update: {
        name: category.name,
        parentId: null,
        displayOrder: categoryIndex + 1,
        description: `${category.name} products available from RF Telecom LB in Lebanon.`,
        seoTitle: `${category.name} in Lebanon`,
        seoDescription: `${category.name} products available from RF Telecom LB in Lebanon.`,
      },
      create: {
        name: category.name,
        slug: slugify(category.name),
        parentId: null,
        displayOrder: categoryIndex + 1,
        description: `${category.name} products available from RF Telecom LB in Lebanon.`,
        seoTitle: `${category.name} in Lebanon`,
        seoDescription: `${category.name} products available from RF Telecom LB in Lebanon.`,
      },
    });

    for (const [subcategoryIndex, subcategoryName] of category.children.entries()) {
      await prisma.category.upsert({
        where: { slug: slugify(subcategoryName) },
        update: {
          name: subcategoryName,
          parentId: parent.id,
          displayOrder: subcategoryIndex + 1,
          description: `${subcategoryName} products in ${category.name} available from RF Telecom LB in Lebanon.`,
          seoTitle: `${subcategoryName} in Lebanon`,
          seoDescription: `${subcategoryName} products in ${category.name} available from RF Telecom LB in Lebanon.`,
        },
        create: {
          name: subcategoryName,
          slug: slugify(subcategoryName),
          parentId: parent.id,
          displayOrder: subcategoryIndex + 1,
          description: `${subcategoryName} products in ${category.name} available from RF Telecom LB in Lebanon.`,
          seoTitle: `${subcategoryName} in Lebanon`,
          seoDescription: `${subcategoryName} products in ${category.name} available from RF Telecom LB in Lebanon.`,
        },
      });
    }
  }
}

async function main() {
  await seedAdmin();
  await seedBrands();
  await seedCategories();

  const [categoryCount, brandCount] = await Promise.all([prisma.category.count(), prisma.brand.count()]);
  process.stdout.write(`Seeded ${categoryCount} categories/subcategories and ${brandCount} brands.\n`);
}

main()
  .catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.stack || error.message : String(error)}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
