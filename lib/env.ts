export function getSiteUrl() {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function getWhatsAppOrderNumber() {
  return (process.env.WHATSAPP_ORDER_NUMBER || "9611271999").replace(/[^\d]/g, "");
}

export function getAuthSecret() {
  const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET;

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET or JWT_SECRET must be set in production.");
  }

  return secret || "development-only-change-this-secret-before-production";
}

export function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl && process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL must be set in production.");
  }

  return databaseUrl || "postgresql://postgres:postgres@localhost:5432/rftelecomlb?schema=public";
}
