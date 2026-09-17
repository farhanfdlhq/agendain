import type { Metadata } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/site";

/** Kartu brand default (foto Colosseum + wordmark) untuk halaman tanpa foto khas. */
const DEFAULT_OG = `${SITE_URL}/og-image.jpg`;

/**
 * URL `og:image` untuk foto khas sebuah halaman.
 *
 * Foto lokal (/uploads dari CMS atau aset /public) dilewatkan ke endpoint /og
 * agar dipangkas 1200x630 & dikonversi ke JPG — scraper WhatsApp/Facebook paling
 * andal dengan JPG/PNG, sedangkan foto situs mayoritas WebP. Nilai kosong atau
 * URL eksternal jatuh ke kartu brand default (anti-SSRF: hanya path lokal).
 */
export function ogImage(src?: string | null, card?: { title?: string; subtitle?: string }): string {
  if (typeof src !== "string") return DEFAULT_OG;
  const s = src.trim();
  if (!s || !s.startsWith("/") || s.startsWith("//")) return DEFAULT_OG;
  const q = new URLSearchParams({ src: s });
  // Teks kartu (judul + subjudul) di-overlay di atas foto — meniru hero halaman.
  // Tanpa `card`, endpoint mengembalikan foto ter-crop apa adanya.
  if (card?.title?.trim()) {
    q.set("title", card.title.trim());
    if (card.subtitle?.trim()) q.set("subtitle", card.subtitle.trim());
  }
  return `${SITE_URL}/og?${q.toString()}`;
}

/**
 * Metadata per-halaman: canonical self-referencing + OG/Twitter memakai foto
 * halaman itu sendiri.
 *
 * CATATAN: metadata Next TIDAK deep-merge — halaman yang menyetel `openGraph`
 * menggantikan `openGraph` root layout SEUTUHNYA (bukan menggabung). Helper ini
 * memusatkan field wajib (type/siteName/url/locale/images) agar tak ada yang
 * hilang saat di-override per halaman.
 */
export function pageMeta(opts: {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
  /** Teks yang di-overlay di atas foto og:image (meniru hero halaman). */
  card?: { title?: string; subtitle?: string };
}): Metadata {
  const img = ogImage(opts.image, opts.card);
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: {
      type: "website",
      siteName: "Agendain",
      url: absoluteUrl(opts.path),
      title: opts.title,
      description: opts.description,
      locale: "id_ID",
      images: [{ url: img, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [img],
    },
  };
}
