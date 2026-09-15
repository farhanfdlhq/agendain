/**
 * URL kanonik situs, dipakai untuk metadata SEO, sitemap, robots, dan
 * canonical/Open Graph. Default ke domain production; bisa ditimpa lewat
 * env `NEXT_PUBLIC_SITE_URL` (mis. staging) tanpa mengubah kode.
 *
 * Selalu tanpa trailing slash agar penggabungan path konsisten.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://agendain.com"
).replace(/\/+$/, "");

/** Gabung path relatif ke URL absolut situs. */
export const absoluteUrl = (path = "/"): string =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
