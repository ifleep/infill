"use client";

import { create } from "zustand";

interface PrintUploadState {
  file: File | null;
  setFile: (file: File | null) => void;
}

/**
 * Holds a customer's uploaded print file in memory only, so the homepage
 * quick-quote widget can hand it off to the full calculator page via a
 * client-side navigation without asking them to upload it twice. Never
 * persisted to storage — File objects aren't serializable, and there's no
 * need for the upload to survive a reload.
 */
export const usePrintUploadStore = create<PrintUploadState>((set) => ({
  file: null,
  setFile: (file) => set({ file }),
}));
