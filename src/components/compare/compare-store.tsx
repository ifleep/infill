"use client";

import { create } from "zustand";
import { useEffect } from "react";

interface CompareState {
  ids: string[];
  hydrated: boolean;
  hydrate: () => void;
  toggle: (id: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "infillpk-compare";
const MAX_COMPARE = 3;

function persist(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export const useCompareStore = create<CompareState>((set, get) => ({
  ids: [],
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) set({ ids: JSON.parse(raw) });
    } catch {
      // ignore
    }
    set({ hydrated: true });
  },
  toggle: (id) => {
    const ids = get().ids;
    const next = ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id].slice(-MAX_COMPARE);
    persist(next);
    set({ ids: next });
  },
  clear: () => {
    persist([]);
    set({ ids: [] });
  },
}));

export function useCompareCount() {
  return useCompareStore((s) => s.ids.length);
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useCompareStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
