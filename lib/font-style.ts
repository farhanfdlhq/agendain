import type { CSSProperties } from "react";

/**
 * Gabungkan fontWeight + fontSize dari nilai CMS (keduanya opsional).
 * Kosong = tidak menimpa (pakai ukuran/berat default desain).
 */
export function fontStyleFrom(weight?: unknown, size?: unknown): CSSProperties | undefined {
  const w = weight ? Number(weight) : undefined;
  const s = size ? Number(size) : undefined;
  if (!w && !s) return undefined;
  return {
    ...(w ? { fontWeight: w } : {}),
    ...(s ? { fontSize: s } : {}),
  };
}

/**
 * Ambil weight+size dari getter CMS berbasis nama field.
 * mis. fontStyle(gs, "heroTitle") membaca heroTitleWeight + heroTitleSize.
 */
export function fontStyle(get: (k: string) => unknown, field: string): CSSProperties | undefined {
  return fontStyleFrom(get(`${field}Weight`), get(`${field}Size`));
}
