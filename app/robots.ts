import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * /robots.txt — mengizinkan mesin telusur meng-crawl halaman publik, tetapi
 * memblokir area privat/rahasia: dashboard admin, endpoint API, serta dokumen
 * invoice & itinerary yang tautannya per-klien (juga sudah `noindex` sendiri).
 *
 * Bot AI (keputusan 23 Nov 2026, opsi "buka semua"): semua crawler AI boleh,
 * termasuk training. Isi situs = materi promosi, jadi lebih berguna bila AI
 * mengenal Agendain. Google-Extended DISEBUT EKSPLISIT karena Google hanya
 * memasukkan situs yang secara eksplisit mengizinkannya ke jawaban aplikasi
 * Gemini, dan nanti menganggapnya "dilarang" bila tidak disebut tapi ada sinyal
 * pelatihan AI umum. Pemblokiran AI di Cloudflare (AI Crawler and Agent access
 * policies + robots.txt terkelola) dimatikan agar tidak menimpa file ini.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/invoice", "/itinerary"],
      },
      {
        userAgent: ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended"],
        allow: "/",
        disallow: ["/admin", "/api", "/invoice", "/itinerary"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
