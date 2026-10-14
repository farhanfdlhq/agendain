/**
 * Logika murni daftar artikel /blog (dipaginasi di server lewat URL).
 *
 * Halaman 1 tanpa filter menampilkan 1 Artikel Terbaru + 1 grid penuh, halaman
 * berikutnya hanya grid. Grid 3 kolom × 3 baris supaya tiap halaman pendek.
 */
export const BLOG_GRID_SIZE = 9

export type BlogListQuery = {
  page: number
  kategori: string | null
  q: string
}

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export function parseBlogQuery(params: Record<string, string | string[] | undefined>): BlogListQuery {
  const page = Number.parseInt(first(params.page) ?? "", 10)
  // `category` = nama parameter lama di tautan breadcrumb artikel — tetap diterima.
  const kategori = (first(params.kategori) ?? first(params.category) ?? "").trim()
  const q = (first(params.q) ?? "").trim().slice(0, 100)
  return {
    page: Number.isFinite(page) && page > 1 ? page : 1,
    kategori: kategori || null,
    q,
  }
}

/** Artikel Terbaru hanya di daftar "Semua" tanpa pencarian (sama seperti sebelumnya). */
export const hasFeatured = (query: Pick<BlogListQuery, "kategori" | "q">) => !query.kategori && !query.q

/** Jumlah halaman untuk `total` artikel yang cocok dengan filter. */
export function blogPageCount(total: number, featured: boolean): number {
  if (total <= 0) return 1
  const rest = featured ? Math.max(0, total - 1) : total
  return Math.max(1, Math.ceil(rest / BLOG_GRID_SIZE))
}

/** skip/take Prisma untuk halaman tertentu (halaman 1 + Artikel Terbaru mengambil 1 lebih banyak). */
export function blogPageWindow(page: number, featured: boolean): { skip: number; take: number } {
  if (!featured) return { skip: (page - 1) * BLOG_GRID_SIZE, take: BLOG_GRID_SIZE }
  if (page === 1) return { skip: 0, take: BLOG_GRID_SIZE + 1 }
  return { skip: 1 + (page - 1) * BLOG_GRID_SIZE, take: BLOG_GRID_SIZE }
}

/**
 * URL daftar blog. Parameter kosong & page=1 dibuang agar URL kanonis bersih.
 * `#artikel` membawa pengguna ke bar filter, bukan ke atas hero lagi.
 */
export function blogListHref(query: Partial<BlogListQuery>, anchor = true): string {
  const sp = new URLSearchParams()
  if (query.kategori) sp.set("kategori", query.kategori)
  if (query.q) sp.set("q", query.q)
  if (query.page && query.page > 1) sp.set("page", String(query.page))
  const qs = sp.toString()
  return `/blog${qs ? `?${qs}` : ""}${anchor ? "#artikel" : ""}`
}

/** Perkiraan menit baca dari HTML artikel (200 kata/menit). */
export function readMinutes(html: string | null | undefined): number {
  const text = (html ?? "").replace(/<[^>]*>?/gm, " ").trim()
  if (!text) return 1
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200))
}
