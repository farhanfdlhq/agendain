import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * /robots.txt — mengizinkan mesin telusur meng-crawl halaman publik, tetapi
 * memblokir area privat/rahasia: dashboard admin, endpoint API, serta dokumen
 * invoice & itinerary yang tautannya per-klien (juga sudah `noindex` sendiri).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/invoice", "/itinerary"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
