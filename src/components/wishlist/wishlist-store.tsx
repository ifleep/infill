"use client";

import { create } from "zustand";
import { useEffect } from "react";

interface WishlistState {
  ids: string[];
  hydrated: boolean;
  hydrate: () => void;
  add: (id: string) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
}

const STORAGE_KEY = "infillpk-wishlist";

function persist(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // storage unavailable — wishlist stays in-memory for this session
  }
}

// Same browser-only, localStorage-backed pattern as the cart and compare
// stores (see cart-store.tsx / compare-store.ts) — just product ids, not a
// price/quantity snapshot, since a wishlist should reflect the product's
// current price/stock whenever it's viewed, not what it was when added.
export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: [],
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) set({ ids: JSON.parse(raw) });
    } catch {
      // ignore malformed/blocked storage
    }
    set({ hydrated: true });
  },
  add: (id) => {
    const ids = get().ids;
    if (ids.includes(id)) return;
    const next = [...ids, id];
    persist(next);
    set({ ids: next });
  },
  toggle: (id) => {
    const ids = get().ids;
    const next = ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id];
    persist(next);
    set({ ids: next });
  },
  remove: (id) => {
    const next = get().ids.filter((i) => i !== id);
    persist(next);
    set({ ids: next });
  },
}));

export function useWishlistCount() {
  return useWishlistStore((s) => s.ids.length);
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useWishlistStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
