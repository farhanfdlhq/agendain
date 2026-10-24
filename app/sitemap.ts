import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL, absoluteUrl } from "@/lib/site";

// Sitemap disegarkan berkala (1 jam) supaya paket/artikel baru ikut terindeks
// tanpa perlu build ulang.
export const revalidate = 3600;

function extractFotoUrl(foto: unknown): string | null {
  if (typeof foto === "string" && foto.trim()) return foto.trim();
  if (Array.isArray(foto) && foto.length > 0) {
    const first = foto[0];
    if (typeof first === "string" && first.trim()) return first.trim();
    if (first && typeof first === "object") {
      const obj = first as any;
      const url = obj.full || obj.large || obj.medium || obj.thumb;
      if (typeof url === "string" && url.trim()) return url.trim();
    }
  } else if (foto && typeof foto === "object") {
    const obj = foto as any;
    const url = obj.full || obj.large || obj.medium || obj.thumb;
    if (typeof url === "string" && url.trim()) return url.trim();
  }
  return null;
}

// Halaman statis publik. `changeFrequency`/`priority` hanya petunjuk lunak untuk
// crawler — beranda diberi prioritas tertinggi.
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/open-trip", priority: 0.9, changeFrequency: "daily" },
  { path: "/private-trip", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.7, changeFrequency: "daily" },
  { path: "/tentang", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
    images: [absoluteUrl(r.path === "/" ? "/hero-coastal.webp" : "/og-image.jpg")],
  }));

  // Halaman dinamis dibaca dari DB. Kegagalan DB TIDAK boleh menjatuhkan
  // sitemap — cukup kembalikan rute statis agar Google tetap menerima peta.
  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const [openTrips, posts] = await Promise.all([
      prisma.openTrip.findMany({
        where: { status: { in: ["published", "publish"] } },
        select: { slug: true, updatedAt: true, foto: true },
      }),
      prisma.blogPost.findMany({
        where: { status: "published" },
        select: { slug: true, updatedAt: true, publishedAt: true, thumbnail: true, ogImage: true },
      }),
    ]);

    dynamicEntries = [
      ...openTrips.map((p) => {
        const img = extractFotoUrl(p.foto);
        return {
          url: `${SITE_URL}/open-trip/${p.slug}`,
          lastModified: p.updatedAt ?? now,
          changeFrequency: "weekly" as const,
          priority: 0.8,
          ...(img ? { images: [absoluteUrl(img)] } : {}),
        };
      }),
      ...posts.map((p) => {
        const img = p.ogImage || p.thumbnail;
        return {
          url: `${SITE_URL}/blog/${p.slug}`,
          lastModified: p.updatedAt ?? p.publishedAt ?? now,
          changeFrequency: "monthly" as const,
          priority: 0.7,
          ...(img ? { images: [absoluteUrl(img)] } : {}),
        };
      }),
    ];
  } catch (error) {
    console.error("Gagal membaca data dinamis untuk sitemap:", error);
  }

  return [...staticEntries, ...dynamicEntries];
}
