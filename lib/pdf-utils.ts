import { existsSync } from "fs";
import { readFile } from "fs/promises";
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
/** Sumber gambar untuk <Image> @react-pdf: path berkas, atau buffer hasil konversi. */
export type PdfImageSrc = string | { data: Buffer; format: "png" | "jpg" };

// @react-pdf hanya bisa memuat PNG & JPEG. Unggahan dikonversi ke WebP
// (app/api/upload), jadi logo/tanda tangan/gambar aktivitas dulu HILANG diam-diam
// di PDF meski tampil di halaman web. Berkas non-PNG/JPG dikonversi ke PNG oleh
// siapkanGambarPdf() sebelum render, lalu disajikan dari cache memori ini.
const FORMAT_PDF = /\.(png|jpe?g)$/i;
const cacheKonversi = new Map<string, Buffer>();
const BATAS_CACHE = 60;

export function sumberGambar(url: string | null | undefined): PdfImageSrc | null {
  const berkas = berkasLokal(url);
  if (!berkas) return null;
  if (FORMAT_PDF.test(berkas)) return berkas;
  const png = cacheKonversi.get(berkas);
  return png ? { data: png, format: "png" } : null;
}

/**
 * Panggil (await) sebelum renderToBuffer: konversi gambar WebP/GIF/AVIF ke PNG
 * agar sumberGambar() bisa menyajikannya. Gagal konversi = gambar dilewati,
 * PDF tetap jadi.
 */
export async function siapkanGambarPdf(urls: Array<string | null | undefined>): Promise<void> {
  const perlu = [...new Set(urls.map(berkasLokal))].filter(
    (b): b is string => !!b && !FORMAT_PDF.test(b) && !cacheKonversi.has(b),
  );
  if (perlu.length === 0) return;
  const sharp = (await import("sharp")).default;
  await Promise.all(
    perlu.map(async (berkas) => {
      try {
        // Baca ke buffer dulu: sharp(path) membuat libvips menahan handle berkas
        // (di Windows berkas jadi tak bisa dihapus dari Media sesudahnya).
        const png = await sharp(await readFile(/*turbopackIgnore: true*/ berkas)).png().toBuffer();
        if (cacheKonversi.size >= BATAS_CACHE) {
          cacheKonversi.delete(cacheKonversi.keys().next().value!);
        }
        cacheKonversi.set(berkas, png);
      } catch (e) {
        console.error("[pdf] gagal konversi gambar", path.basename(berkas), e);
      }
    }),
  );
}

function berkasLokal(url: string | null | undefined): string | null {
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

  // `turbopackIgnore`: `berkas` dinamis, tapi sudah dibatasi ke dalam public/ di
  // atas. Tanpa ini Turbopack menelusuri SELURUH proyek ke output server (bundle
  // membengkak). Aman karena bukan import modul, hanya cek keberadaan berkas.
  return existsSync(/*turbopackIgnore: true*/ berkas) ? berkas : null;
}
