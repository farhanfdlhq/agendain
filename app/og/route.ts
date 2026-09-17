import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

// Butuh fs + sharp → runtime Node (bukan edge).
export const runtime = "nodejs";

// Kartu share jarang berubah; boleh di-cache lama (Cloudflare menghormati ini).
const CACHE = "public, max-age=86400, stale-while-revalidate=604800";
const ALLOWED = /\.(webp|jpe?g|png|avif)$/i;
const PUBLIC_DIR = path.join(process.cwd(), "public");

/** Foto tak ditemukan/tak valid → kartu brand default agar share tak pernah kosong. */
async function fallback(): Promise<Response> {
  const buf = await readFile(path.join(PUBLIC_DIR, "og-image.jpg"));
  return new Response(new Uint8Array(buf), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": CACHE },
  });
}

/**
 * /og?src=/uploads/foo.webp — mengembalikan foto halaman dipangkas 1200x630 JPG
 * untuk dipakai sebagai og:image. Sengaja di luar /api (yang diblokir robots.txt)
 * agar scraper WhatsApp/Facebook bebas mengambilnya.
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const src = new URL(request.url).searchParams.get("src") || "";

    // Hanya path lokal aman: mulai "/", bukan "//", tanpa "..", ekstensi gambar.
    if (
      !src.startsWith("/") ||
      src.startsWith("//") ||
      src.includes("..") ||
      !ALLOWED.test(src)
    ) {
      return fallback();
    }

    const filePath = path.join(PUBLIC_DIR, src);
    // Anti path-traversal: hasil join harus tetap di dalam /public.
    if (!filePath.startsWith(PUBLIC_DIR)) return fallback();

    let input: Buffer;
    try {
      input = await readFile(filePath);
    } catch {
      return fallback();
    }

    const sharp = (await import("sharp")).default;
    const out = await sharp(input)
      .resize(1200, 630, { fit: "cover", position: "attention" })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();

    return new Response(new Uint8Array(out), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": CACHE },
    });
  } catch {
    try {
      return await fallback();
    } catch {
      return NextResponse.json({ error: "og image failed" }, { status: 500 });
    }
  }
}
