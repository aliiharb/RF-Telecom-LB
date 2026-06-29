export function getSiteUrl() {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function getWhatsAppOrderNumber() {
  return (process.env.WHATSAPP_ORDER_NUMBER || "9611271999").replace(/[^\d]/g, "");
}

export function getAuthSecret() {
  const authSecret = process.env.AUTH_SECRET;
  const jwtSecret = process.env.JWT_SECRET;

  if (process.env.NODE_ENV === "production") {
    if (!authSecret) {
      throw new Error("AUTH_SECRET must be set in production.");
    }

    if (!jwtSecret) {
      throw new Error("JWT_SECRET must be set in production.");
    }
  }

  return authSecret || jwtSecret || "";
}

export function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl && process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL must be set in production.");
  }

  return databaseUrl || "";
}
