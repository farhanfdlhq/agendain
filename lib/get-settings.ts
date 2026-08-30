import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Seluruh baris `Setting` sebagai objek key→value, di-cache dengan tag yang
 * SAMA (`settings`) dengan getSettings() di app/layout.tsx — jadi ikut
 * ter-invalidasi setiap kali CMS menyimpan (revalidateTag('settings')).
 *
 * Dipakai server component yang perlu setting tanpa menarik `next/server`,
 * mis. halaman login yang butuh `site_logo` sudah ada di HTML pertamanya
 * (menghindari kedip logo dummy → logo asli saat fetch klien).
 *
 * Kegagalan DB sengaja TIDAK di-cache: dilempar keluar unstable_cache lewat
 * getSiteSettings() agar satu kedipan DB tidak mengunci hasil kosong sejam.
 */
const fetchSiteSettings = unstable_cache(
  async () => {
    const rows = await prisma.setting.findMany();
    return rows.reduce<Record<string, string>>(
      (acc, curr) => ((acc[curr.key] = curr.value), acc),
      {},
    );
  },
  ["site-settings"],
  { tags: ["settings"], revalidate: 3600 },
);

export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    return await fetchSiteSettings();
  } catch (e) {
    console.error("Failed to fetch site settings", e);
    return {};
  }
}
