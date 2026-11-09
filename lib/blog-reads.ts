/**
 * Hitungan "dibaca" artikel blog — logika murni (dipakai klien, API, dan tes).
 *
 * Satu "baca" = artikel dibuka dengan tab terlihat (sejak 9 Nov 2026; dulu
 * syaratnya bertahan 15 detik atau menggulir separuh artikel); dihitung 1x per
 * browser per READ_DEDUPE_MS. Angka publik baru tampil setelah READ_PUBLIC_MIN agar artikel
 * baru tidak terlihat sepi; admin selalu melihat angka asli.
 */
export const READ_DEDUPE_MS = 24 * 60 * 60 * 1000
export const READ_PUBLIC_MIN = 50

export const shouldShowReadCount = (count: number | null | undefined) =>
  typeof count === "number" && count >= READ_PUBLIC_MIN

export function formatReadCount(count: number, locale: string): string {
  const n = new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID").format(count)
  return locale === "en" ? `${n} reads` : `${n} kali dibaca`
}

// Crawler, preview tautan, dan klien HTTP otomatis — tidak dihitung.
const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|quora link|whatsapp|telegram|discord|curl|wget|python-requests|httpclient|headless|lighthouse|pagespeed/i

export function isBotUserAgent(ua: string | null | undefined): boolean {
  if (!ua || ua.trim().length < 10) return true
  return BOT_UA.test(ua)
}

/** Sudah dihitung dalam jendela dedupe? `last` = timestamp ms dari localStorage. */
export function readRecently(last: string | null, now: number): boolean {
  const t = Number(last)
  return Number.isFinite(t) && t > 0 && now - t < READ_DEDUPE_MS
}
