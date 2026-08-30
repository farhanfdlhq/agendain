import { existsSync } from "fs";
import path from "path";

/**
 * @react-pdf tidak mengerti URL root-relative seperti `/uploads/x.png`.
 * Diubah ke path berkas nyata di `public/`; bila berkasnya tidak ada, gambar
 * DILEWATI (kembalikan null) — satu gambar hilang jauh lebih baik daripada
 * seluruh PDF gagal dirender. URL http(s) diloloskan apa adanya.
 *
 * Dipakai bersama renderer PDF invoice & itinerary.
 */
export function sumberGambar(url: string): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (!url.startsWith("/")) return null;
  const berkas = path.join(process.cwd(), "public", decodeURIComponent(url));
  return existsSync(berkas) ? berkas : null;
}
