/**
 * Menanam logo & favicon yang sedang terpasang di Pengaturan ke halaman error
 * statis (public/error-page.html). Halaman itu disajikan nginx saat aplikasi
 * mati, jadi tak bisa membaca DB — gambarnya harus sudah tertanam (data URI).
 * Dipanggil saat deploy oleh scripts/build-error-page.ts. Fungsi murni.
 */

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
}

/** Batas ukuran per gambar: halaman error harus tetap ringan. */
export const MAX_BRAND_BYTES = 300 * 1024

export function mimeFromPath(p: string): string | null {
  const ext = p.split("?")[0].split(".").pop()?.toLowerCase() ?? ""
  return MIME[ext] ?? null
}

export function toDataUri(bytes: Uint8Array, mime: string): string {
  return `data:${mime};base64,${Buffer.from(bytes).toString("base64")}`
}

/**
 * Path setting (mis. "/uploads/a.png", "/Logo%20(%20White%20Version%20).png")
 * → path relatif di dalam public/. Hanya path lokal; URL luar / path yang
 * mencoba keluar folder ditolak (null).
 */
export function publicRelativePath(setting: unknown): string | null {
  if (typeof setting !== "string") return null
  const v = setting.trim()
  if (!v.startsWith("/") || v.startsWith("//")) return null
  let decoded: string
  try {
    decoded = decodeURI(v.split("?")[0])
  } catch {
    return null
  }
  const rel = decoded.replace(/^\/+/, "")
  if (!rel || rel.split(/[\\/]/).includes("..")) return null
  return rel
}

/** Ganti src logo (`<img id="site-logo">`) dan pasang favicon. */
export function injectBrand(html: string, brand: { logo?: string; favicon?: string }): string {
  let out = html
  if (brand.logo) {
    out = out.replace(/(<img id="site-logo" src=")[^"]*(")/, `$1${brand.logo}$2`)
  }
  if (brand.favicon) {
    const link = `<link rel="icon" id="site-favicon" href="${brand.favicon}">`
    out = /<link rel="icon" id="site-favicon"[^>]*>/.test(out)
      ? out.replace(/<link rel="icon" id="site-favicon"[^>]*>/, link)
      : out.replace("<!--site-favicon-->", link)
  }
  return out
}
