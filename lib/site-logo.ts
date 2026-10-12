/**
 * Logo cadangan Agendain (file di `public/`, ikut repo — ada di lokal & production).
 *
 * Dipakai bila `site_logo` di Pengaturan belum diisi (atau masih nilai bawaan
 * "/logo.png"). Versi PUTIH untuk latar gelap (navbar, footer, panel login),
 * versi BIRU untuk latar terang (mis. logo Organization di data terstruktur).
 * Nama file berspasi → ditulis ter-encode agar aman sebagai URL.
 */
export const LOGO_WHITE = "/Logo%20(%20White%20Version%20).png"
export const LOGO_BLUE = "/Logo%20(%20blue%20Version%20).png"

/** `site_logo` dari CMS bila sudah diisi; selain itu logo cadangan. */
export function siteLogoOr(value: unknown, fallback: string = LOGO_WHITE): string {
  return typeof value === "string" && value.trim() !== "" && value !== "/logo.png" ? value : fallback
}
