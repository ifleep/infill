"use client";

import { create } from "zustand";
import { useEffect } from "react";
import type { Product } from "@/lib/types";
import { CartDrawer } from "@/components/cart/cart-drawer";

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  brandName: string;
  price: number;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  hydrated: boolean;
  open: () => void;
  close: () => void;
  addItem: (product: Product, brandName: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  hydrate: () => void;
}

const STORAGE_KEY = "infillpk-cart";

function persist(lines: CartLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // storage unavailable — cart stays in-memory for this session
  }
}

export const useCartStore = create<CartState>((set, get) => ({
  lines: [],
  isOpen: false,
  hydrated: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  hydrate: () => {
    if (get().hydrated) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) set({ lines: JSON.parse(raw) });
    } catch {
      // ignore malformed/blocked storage
    }
    set({ hydrated: true });
  },
  addItem: (product, brandName, quantity = 1) => {
    const lines = [...get().lines];
    const existing = lines.find((l) => l.productId === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      lines.push({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brandName,
        price: product.price,
        quantity,
      });
    }
    persist(lines);
    set({ lines, isOpen: true });
  },
  removeItem: (productId) => {
    const lines = get().lines.filter((l) => l.productId !== productId);
    persist(lines);
    set({ lines });
  },
  setQuantity: (productId, quantity) => {
    const lines = get()
      .lines.map((l) => (l.productId === productId ? { ...l, quantity } : l))
      .filter((l) => l.quantity > 0);
    persist(lines);
    set({ lines });
  },
}));

export function useCartCount() {
  return useCartStore((s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));
}

export function useCartTotal() {
  return useCartStore((s) => s.lines.reduce((sum, l) => sum + l.quantity * l.price, 0));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useCartStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      {children}
      <CartDrawer />
    </>
  );
}
