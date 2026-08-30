import { existsSync } from "fs";
import path from "path";

/**
 * URL gambar (root-relative `/uploads/x.png`) → path berkas nyata untuk
 * @react-pdf. Bila tak valid/tak ada, gambar DILEWATI (null) — satu gambar
 * hilang jauh lebih baik daripada PDF gagal dirender. Dipakai bersama renderer
 * PDF invoice & itinerary.
 *
 * KEAMANAN (dua vektor ditutup di sini karena @react-pdf membaca sumber ini
 * SERVER-SIDE saat render):
 *  - SSRF: URL http(s) eksternal TIDAK diteruskan. Sebelumnya diloloskan apa
 *    adanya sehingga @react-pdf mem-fetch-nya (mis. metadata cloud
 *    169.254.169.254). Semua gambar sah diunggah ke /uploads, jadi hanya berkas
 *    lokal yang dilayani.
 *  - Path traversal: nilai seperti `/../../.env` (lolos StoredUrl karena diawali
 *    `/`) dulu me-resolve ke luar `public/` → @react-pdf membaca berkas rahasia.
 *    Kini path hasil resolve WAJIB berada di dalam `public/`.
 */
export function sumberGambar(url: string): string | null {
  if (!url || !url.startsWith("/")) return null;

  const root = path.resolve(process.cwd(), "public");
  let berkas: string;
  try {
    berkas = path.resolve(root, "." + decodeURIComponent(url));
  } catch {
    return null; // decodeURIComponent bisa melempar pada %-encoding rusak
  }

  // Containment: hanya berkas di dalam public/ (cegah "/../.." keluar root).
  if (berkas !== root && !berkas.startsWith(root + path.sep)) return null;

  return existsSync(berkas) ? berkas : null;
}
