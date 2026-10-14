"use client";
import { useLayoutEffect, useState, type RefObject } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Animasi reveal sebagai progressive enhancement (skill scroll-patterns §3).
 *
 * HTML server selalu merender konten TERLIHAT — tetap terbaca bila JS lambat
 * atau gagal dimuat, dan konten di layar pertama tidak menunggu animasi (LCP).
 * Setelah hidrasi, hanya elemen yang mulai di bawah layar yang disembunyikan
 * lalu dianimasikan saat discroll; pengguna reduced-motion tidak pernah.
 */
export function useBelowFoldReveal(ref: RefObject<HTMLElement | null>): boolean {
  const reduce = useReducedMotion();
  const [animate, setAnimate] = useState(false);

  // Layout effect: diputuskan sebelum paint pertama pasca-hidrasi, dan elemen
  // yang disembunyikan berada di luar layar → tidak ada kedipan yang terlihat.
  useLayoutEffect(() => {
    const el = ref.current;
    if (reduce || !el) return;
    if (el.getBoundingClientRect().top > window.innerHeight) setAnimate(true);
  }, [reduce, ref]);

  return animate;
}
