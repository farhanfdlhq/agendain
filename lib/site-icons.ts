import type { Metadata } from "next"

/**
 * Set favicon brand (file di `public/icons/`, ikut repo): huruf "g" logo
 * agendain.id berwarna putih di kotak navy, diambil dari vektor logo resmi.
 * Kotak berlatar membuat ikon tetap terlihat di tab terang maupun gelap.
 */
export const BRAND_ICONS = {
  svg: "/icons/favicon.svg",
  png32: "/icons/favicon-32x32.png",
  png16: "/icons/favicon-16x16.png",
  ico: "/icons/favicon.ico",
  apple: "/icons/apple-touch-icon.png",
  png192: "/icons/icon-192.png",
  png512: "/icons/icon-512.png",
  maskable512: "/icons/icon-maskable-512.png",
} as const

/** Favicon unggahan CMS dianggap ada bila diisi dan bukan nilai bawaan "/favicon.ico". */
export function customFavicon(value: unknown): string | null {
  if (typeof value !== "string") return null
  const v = value.trim()
  return v && v !== "/favicon.ico" ? v : null
}

/**
 * Ikon untuk metadata halaman. Favicon unggahan CMS tetap diutamakan untuk tab;
 * tanpa unggahan, dipakai set brand lengkap (SVG + PNG 32/16 + ICO). Ikon iPhone
 * memakai PNG persegi brand kecuali unggahan CMS berupa PNG/JPG/WebP — iOS tidak
 * bisa memakai ICO.
 */
export function siteIcons(cmsFavicon: unknown): NonNullable<Metadata["icons"]> {
  const custom = customFavicon(cmsFavicon)
  const appleFromCms = custom && /\.(png|jpe?g|webp)(\?|$)/i.test(custom) ? custom : null
  if (custom) {
    return { icon: custom, shortcut: custom, apple: appleFromCms ?? BRAND_ICONS.apple }
  }
  return {
    icon: [
      { url: BRAND_ICONS.svg, type: "image/svg+xml" },
      { url: BRAND_ICONS.png32, type: "image/png", sizes: "32x32" },
      { url: BRAND_ICONS.png16, type: "image/png", sizes: "16x16" },
    ],
    shortcut: BRAND_ICONS.ico,
    apple: { url: BRAND_ICONS.apple, sizes: "180x180" },
  }
}
