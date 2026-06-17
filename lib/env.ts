export function getSiteUrl() {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function getWhatsAppOrderNumber() {
  return (process.env.WHATSAPP_ORDER_NUMBER || "9611271999").replace(/[^\d]/g, "");
}

export function getAuthSecret() {
  return (
    process.env.AUTH_SECRET ||
    process.env.JWT_SECRET ||
    "development-only-change-this-secret-before-production"
  );
}

export function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    "postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"
  );
}
