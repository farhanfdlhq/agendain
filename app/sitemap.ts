import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

// Sitemap disegarkan berkala (1 jam) supaya paket/artikel baru ikut terindeks
// tanpa perlu build ulang.
export const revalidate = 3600;

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
  }));

  // Halaman dinamis dibaca dari DB. Kegagalan DB TIDAK boleh menjatuhkan
  // sitemap — cukup kembalikan rute statis agar Google tetap menerima peta.
  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const [openTrips, posts] = await Promise.all([
      prisma.openTrip.findMany({
        where: { status: { in: ["published", "publish"] } },
        select: { slug: true, updatedAt: true },
      }),
      prisma.blogPost.findMany({
        where: { status: "published" },
        select: { slug: true, updatedAt: true, publishedAt: true },
      }),
    ]);

    dynamicEntries = [
      ...openTrips.map((p) => ({
        url: `${SITE_URL}/open-trip/${p.slug}`,
        lastModified: p.updatedAt ?? now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...posts.map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: p.updatedAt ?? p.publishedAt ?? now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  } catch (error) {
    console.error("Gagal membaca data dinamis untuk sitemap:", error);
  }

  return [...staticEntries, ...dynamicEntries];
}
