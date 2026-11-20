/**
 * Gerbang slug di proxy: artikel/Open Trip yang tidak ada dijawab 404 sungguhan.
 *
 * `app/loading.tsx` membuat respons mulai di-stream (status 200 terkirim)
 * sebelum halaman sempat memanggil `notFound()`. Akibatnya slug salah dulu
 * dijawab 200 + `noindex` (soft 404 di Google). Proxy berjalan sebelum
 * render, jadi status 404 masih bisa dipasang di sini.
 */
import { isPublishedOpenTrip } from "./open-trip-card"

export type SlugKind = "blog" | "open-trip"

/** "/blog/abc" → { kind: "blog", slug: "abc" }; path lain → null. */
export function parseSlugPath(pathname: string): { kind: SlugKind; slug: string } | null {
  const m = /^\/(blog|open-trip)\/([^/]+)\/?$/.exec(pathname)
  if (!m) return null
  try {
    return { kind: m[1] as SlugKind, slug: decodeURIComponent(m[2]) }
  } catch {
    return null // persen-encoding rusak: biar halaman yang menangani
  }
}

/**
 * Boleh diteruskan ke halaman? `status` = status baris di DB, `null` bila
 * slug tidak ada. Draf Open Trip diteruskan bila ada sesi admin: halaman
 * sendiri yang memeriksa izin pratinjau. Draf artikel tidak punya pratinjau
 * publik, jadi selalu 404.
 */
export function slugIsServable(kind: SlugKind, status: string | null, signedIn: boolean): boolean {
  if (status === null) return false
  if (kind === "blog") return status === "published"
  return isPublishedOpenTrip(status) || signedIn
}
