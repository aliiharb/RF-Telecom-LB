export function formatMoney(price?: number | string | null, currency = "USD") {
  if (price === null || price === undefined || price === "") {
    return "On request";
  }

  const value = typeof price === "string" ? Number(price) : price;

  if (Number.isNaN(value)) {
    return "On request";
  }

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return `${formatted} ${currency}`;
}

export function labelFromEnum(value?: string | null) {
  if (!value) {
    return "";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function asNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  if (typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber();
  }

  return null;
}
