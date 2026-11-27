"use client";
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Pengganti useReducedMotion() dari framer-motion untuk nilai yang ikut
 * menentukan HTML awal (varian, initial, mode tampilan).
 *
 * useReducedMotion() langsung memberi nilai asli pada render pertama di
 * browser, padahal server selalu menganggap `false` → HTML server dan render
 * hidrasi berbeda (hydration mismatch) bagi pengguna "kurangi gerakan".
 * Hook ini memakai `false` selama hidrasi, lalu beralih ke nilai asli.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const m = window.matchMedia(QUERY);
      m.addEventListener("change", onChange);
      return () => m.removeEventListener("change", onChange);
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
