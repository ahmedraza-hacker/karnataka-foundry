"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type BasketLine = { slug: string; quantity: number };

type BasketContextValue = {
  lines: BasketLine[];
  add: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
};

const BasketContext = createContext<BasketContextValue | null>(null);
const storageKey = "kf-enquiry-basket";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<BasketLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setLines(parsed.filter((line): line is BasketLine =>
            typeof line?.slug === "string" &&
            Number.isInteger(line?.quantity) &&
            line.quantity > 0
          ));
        }
      }
    } catch (error) {
      console.error("Unable to read the temporary enquiry basket.", error);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(lines));
    } catch (error) {
      console.error("Unable to save the temporary enquiry basket.", error);
    }
  }, [lines, ready]);

  function add(slug: string, quantity: number) {
    setLines((current) => {
      const found = current.find((line) => line.slug === slug);
      if (found) return current.map((line) => line.slug === slug ? { ...line, quantity: line.quantity + quantity } : line);
      return [...current, { slug, quantity }];
    });
  }

  function remove(slug: string) {
    setLines((current) => current.filter((line) => line.slug !== slug));
  }

  function setQuantity(slug: string, quantity: number) {
    setLines((current) => current.map((line) => line.slug === slug ? { ...line, quantity } : line));
  }

  return <BasketContext.Provider value={{ lines, add, remove, setQuantity, clear: () => setLines([]) }}>{children}</BasketContext.Provider>;
}

export function useCart() {
  const context = useContext(BasketContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
