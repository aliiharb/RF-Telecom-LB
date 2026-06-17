"use client";

// Renders the client-side checkout form and sends the cart to WhatsApp.
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

import { useCart } from "@/components/cart-provider";
import { trackClientEvent } from "@/lib/client-analytics";
import { formatMoney } from "@/lib/format";

type CheckoutFormState = {
  fullName: string;
  phoneCountryCode: string;
  phoneNumber: string;
  paymentMethod: "Cash on Delivery" | "Wish Money";
  deliveryMethod: "Delivery to Address" | "Pickup from Store";
  address: string;
};

type CheckoutErrors = Partial<Record<keyof CheckoutFormState, string>>;

const initialForm: CheckoutFormState = {
  fullName: "",
  phoneCountryCode: "961",
  phoneNumber: "",
  paymentMethod: "Cash on Delivery",
  deliveryMethod: "Delivery to Address",
  address: "",
};

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || process.env.VITE_STORE_NAME || "RF Telecom LB";

const countryCodes = [
  { code: "961", label: "Lebanon", prefix: "+961" },
  { code: "971", label: "United Arab Emirates", prefix: "+971" },
  { code: "966", label: "Saudi Arabia", prefix: "+966" },
  { code: "965", label: "Kuwait", prefix: "+965" },
  { code: "974", label: "Qatar", prefix: "+974" },
  { code: "962", label: "Jordan", prefix: "+962" },
  { code: "963", label: "Syria", prefix: "+963" },
  { code: "964", label: "Iraq", prefix: "+964" },
  { code: "20", label: "Egypt", prefix: "+20" },
];

function normalizeDigits(value: string) {
  return value.replace(/[^\d]/g, "");
}

function getLocalPhoneNumber(phoneNumber: string) {
  return normalizeDigits(phoneNumber).slice(0, 8);
}

function formatLocalPhoneNumber(phoneNumber: string) {
  const digits = getLocalPhoneNumber(phoneNumber);
  const first = digits.slice(0, 2);
  const second = digits.slice(2, 5);
  const third = digits.slice(5, 8);

  return [first, second, third].filter(Boolean).join(" ");
}

function buildCustomerPhone(form: CheckoutFormState) {
  return `+${form.phoneCountryCode} ${formatLocalPhoneNumber(form.phoneNumber)}`;
}

function isValidPhoneNumber(form: CheckoutFormState) {
  const localNumber = getLocalPhoneNumber(form.phoneNumber);
  return /^\d{8}$/.test(localNumber);
}

function validateCheckoutForm(form: CheckoutFormState) {
  const errors: CheckoutErrors = {};

  if (form.fullName.trim().length < 2) {
    errors.fullName = "Enter your full name.";
  }

  if (!form.phoneCountryCode) {
    errors.phoneCountryCode = "Choose a country code.";
  }

  if (!isValidPhoneNumber(form)) {
    errors.phoneNumber = "Enter a valid phone number.";
  }

  if (form.deliveryMethod === "Delivery to Address" && !form.address.trim()) {
    errors.address = "Address is required for delivery.";
  }

  return errors;
}

function formatCheckoutPrice(price: number | null, quantity = 1) {
  return price === null ? "On request" : `$${(price * quantity).toLocaleString()}`;
}

// Builds the WhatsApp order message from cart items and customer form data.
// Returns a plain text message ready to URL-encode for wa.me.
function buildWhatsAppMessage(form: CheckoutFormState, items: ReturnType<typeof useCart>["items"], total: number | null) {
  const itemLines = items
    .map((item) => `• ${item.name} x${item.quantity} — ${formatCheckoutPrice(item.price ?? null, item.quantity)}`)
    .join("\n");

  return [
    "🛒 New Order — RF Telecom LB",
    "",
    `Customer: ${form.fullName.trim()}`,
    `Phone: ${buildCustomerPhone(form)}`,
    `Payment: ${form.paymentMethod}`,
    `Delivery: ${form.deliveryMethod}`,
    form.deliveryMethod === "Delivery to Address" ? `Address: ${form.address.trim()}` : "Address: Pickup from store",
    "",
    "Order:",
    itemLines,
    "",
    `Total: ${formatCheckoutPrice(total)}`,
    "",
    "Sent from rftelecom.lb",
  ].join("\n");
}

export function OrderDetailsForm() {
  const { items, total, hasOnlyPricedItems, clearCart } = useCart();
  const [form, setForm] = useState<CheckoutFormState>(initialForm);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isSubmitDisabled = !items.length || submitting;

  function updateForm(field: keyof CheckoutFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: field === "phoneNumber" ? formatLocalPhoneNumber(value) : value,
    }));
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setSubmitting(true);

    const nextErrors = validateCheckoutForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/orders/whatsapp-redirect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          phone: buildCustomerPhone(form),
          address:
            form.deliveryMethod === "Delivery to Address" ? form.address.trim() : "Pickup from store",
          deliveryMethod: form.deliveryMethod === "Delivery to Address" ? "Delivery" : "Pickup",
          items: items.map((item) => ({
            name: item.name,
            brand: item.brand,
            sku: item.sku,
            category: item.category,
            quantity: item.quantity,
            price: item.price,
            currency: item.currency,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to prepare your WhatsApp order. Please try again.");
      }

      const data = (await response.json()) as { whatsappUrl?: string };

      if (!data.whatsappUrl) {
        throw new Error("Unable to open WhatsApp for this order.");
      }

      await trackClientEvent("/api/analytics/cart-event", {
        eventType: "WHATSAPP_REDIRECT_CLICKED",
        quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      });
      clearCart();
      setSubmitted(true);
      window.location.href = data.whatsappUrl;
    } catch (error) {
      const fallbackMessage = buildWhatsAppMessage(form, items, hasOnlyPricedItems ? total : null);
      setSubmitError(error instanceof Error ? error.message : "Unable to open WhatsApp.");
      console.error(fallbackMessage);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <CheckCircle2 className="mx-auto text-[var(--color-success)]" size={56} aria-hidden="true" />
        <h1 className="mt-5 text-3xl font-bold tracking-[-0.03em] text-[var(--color-text-1)]">
          Your order has been sent!
        </h1>
        <p className="mt-3 text-[var(--color-text-2)]">Thank you for shopping with {STORE_NAME}.</p>
        <Link href="/" className="btn-primary mt-8">
          Back to Store
        </Link>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-3xl font-bold tracking-[-0.03em] text-[var(--color-text-1)]">Your cart is empty</h1>
        <p className="mt-4 text-[var(--color-text-2)]">Add products before sending an order to WhatsApp.</p>
        <Link href="/products" className="btn-primary mt-8">
          Browse Products
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[1fr_380px] lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-text-3)]">Checkout</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--color-text-1)]">
          Send Your Request to WhatsApp
        </h1>
        <form onSubmit={submitOrder} className="mt-8 grid gap-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <label className="grid gap-2 text-sm font-medium text-[var(--color-text-2)]" htmlFor="fullName">
            Full Name
            <input
              id="fullName"
              value={form.fullName}
              onChange={(event) => updateForm("fullName", event.target.value)}
              className={`input h-11 ${errors.fullName ? "error" : ""}`}
            />
          </label>
          <FieldError id="fullName-error" message={errors.fullName} />

          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium text-[var(--color-text-2)]">Phone Number</legend>
            <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
              <label className="grid gap-2 text-sm font-medium text-[var(--color-text-2)]" htmlFor="phoneCountryCode">
                Country code
                <select
                  id="phoneCountryCode"
                  value={form.phoneCountryCode}
                  onChange={(event) => updateForm("phoneCountryCode", event.target.value)}
                  className={`input h-11 ${errors.phoneCountryCode ? "error" : ""}`}
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.prefix} {country.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-[var(--color-text-2)]" htmlFor="phoneNumber">
                Number
                <input
                  id="phoneNumber"
                  inputMode="tel"
                  autoComplete="tel-national"
                  value={form.phoneNumber}
                  onChange={(event) => updateForm("phoneNumber", event.target.value)}
                  className={`input h-11 ${errors.phoneNumber ? "error" : ""}`}
                  placeholder="XX XXX XXX"
                  maxLength={10}
                />
              </label>
            </div>
            <FieldError id="phone-code-error" message={errors.phoneCountryCode} />
            <FieldError id="phone-number-error" message={errors.phoneNumber} />
          </fieldset>

          <fieldset className="grid gap-3">
            <legend className="text-sm font-medium text-[var(--color-text-2)]">Payment Method</legend>
            {(["Cash on Delivery", "Wish Money"] as const).map((paymentMethod) => (
              <label key={paymentMethod} className="flex items-center gap-3 text-sm text-[var(--color-text-1)]">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={form.paymentMethod === paymentMethod}
                  onChange={() => updateForm("paymentMethod", paymentMethod)}
                />
                {paymentMethod}
              </label>
            ))}
          </fieldset>

          <fieldset className="grid gap-3">
            <legend className="text-sm font-medium text-[var(--color-text-2)]">Delivery Method</legend>
            {(["Delivery to Address", "Pickup from Store"] as const).map((deliveryMethod) => (
              <label key={deliveryMethod} className="flex items-center gap-3 text-sm text-[var(--color-text-1)]">
                <input
                  type="radio"
                  name="deliveryMethod"
                  checked={form.deliveryMethod === deliveryMethod}
                  onChange={() => updateForm("deliveryMethod", deliveryMethod)}
                />
                {deliveryMethod}
              </label>
            ))}
          </fieldset>

          {form.deliveryMethod === "Delivery to Address" ? (
            <>
              <label className="grid gap-2 text-sm font-medium text-[var(--color-text-2)]" htmlFor="address">
                Address
                <input
                  id="address"
                  value={form.address}
                  onChange={(event) => updateForm("address", event.target.value)}
                  className={`input h-11 ${errors.address ? "error" : ""}`}
                />
              </label>
              <FieldError id="address-error" message={errors.address} />
            </>
          ) : null}

          {submitError ? (
            <p className="rounded-lg border-l-4 border-[var(--color-danger)] bg-[var(--color-surface-2)] p-3 text-sm text-[var(--color-text-1)]">
              {submitError}
            </p>
          ) : null}
          <button type="submit" disabled={isSubmitDisabled} className="btn-primary h-11 disabled:cursor-not-allowed disabled:opacity-40">
            {submitting ? "Preparing WhatsApp..." : "Send Order"}
          </button>
        </form>
      </div>
      <aside className="h-fit rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="font-medium text-[var(--color-text-1)]">Products</h2>
        <div className="mt-4 grid gap-4">
          {items.map((item) => (
            <div key={item.id} className="border-b border-[var(--color-border)] pb-4 last:border-b-0 last:pb-0">
              <p className="font-medium text-[var(--color-text-1)]">{item.name}</p>
              <p className="mt-1 text-sm text-[var(--color-text-2)]">
                {item.brand || STORE_NAME} / {item.sku || "N/A"}
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-2)]">Quantity: {item.quantity}</p>
              <p className="mono-data mt-1 text-sm text-[var(--color-text-1)]">
                {formatMoney(item.price, item.currency || "USD")}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-between border-t border-[var(--color-border)] pt-4 font-semibold text-[var(--color-text-1)]">
          <span>Total</span>
          <span className="mono-data">{hasOnlyPricedItems ? formatMoney(total, items[0]?.currency || "USD") : "On request"}</span>
        </div>
      </aside>
    </section>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="field-error">
      {message}
    </p>
  ) : null;
}
