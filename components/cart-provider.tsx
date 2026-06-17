"use client";

// Stores cart state in React context and persists it to localStorage.
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { trackClientEvent } from "@/lib/client-analytics";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  brand?: string | null;
  category?: string | null;
  sku?: string | null;
  price?: number | null;
  currency?: string | null;
  image?: string | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number | null;
  count: number;
  hasOnlyPricedItems: boolean;
};

const fallbackCartContext: CartContextValue = {
  items: [],
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  total: null,
  count: 0,
  hasOnlyPricedItems: false,
};

const CartContext = createContext<CartContextValue>(fallbackCartContext);
const STORAGE_KEY = "rf_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setItems(JSON.parse(stored) as CartItem[]);
        } catch {
          setItems([]);
        }
      }
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loaded) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loaded]);

  const value = useMemo<CartContextValue>(() => {
    const hasOnlyPricedItems = items.length > 0 && items.every((item) => typeof item.price === "number");
    const total = hasOnlyPricedItems
      ? items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
      : null;

    return {
      items,
      addItem: (item, quantity = 1) => {
        setItems((current) => {
          const existing = current.find((cartItem) => cartItem.id === item.id);

          if (existing) {
            return current.map((cartItem) =>
              cartItem.id === item.id
                ? { ...cartItem, quantity: cartItem.quantity + quantity }
                : cartItem,
            );
          }

          return [...current, { ...item, quantity }];
        });
        void trackClientEvent("/api/analytics/cart-event", {
          eventType: "PRODUCT_ADDED",
          productId: item.id,
          productName: item.name,
          quantity,
        });
      },
      updateQuantity: (id, quantity) => {
        setItems((current) =>
          quantity <= 0
            ? current.filter((item) => item.id !== id)
            : current.map((item) => (item.id === id ? { ...item, quantity } : item)),
        );
        void trackClientEvent("/api/analytics/cart-event", {
          eventType: "QUANTITY_UPDATED",
          productId: id,
          quantity,
        });
      },
      removeItem: (id) => {
        const item = items.find((cartItem) => cartItem.id === id);
        setItems((current) => current.filter((cartItem) => cartItem.id !== id));
        void trackClientEvent("/api/analytics/cart-event", {
          eventType: "PRODUCT_REMOVED",
          productId: id,
          productName: item?.name,
        });
      },
      clearCart: () => {
        setItems([]);
        window.localStorage.removeItem(STORAGE_KEY);
      },
      total,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      hasOnlyPricedItems,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
