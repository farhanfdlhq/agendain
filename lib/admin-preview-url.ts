/**
 * Tombol "Lihat Website" di header admin membuka halaman publik yang sesuai
 * dengan halaman CMS/admin yang sedang dibuka. Tidak ada padanan → beranda.
 */
const EXACT: Record<string, string> = {
  "/admin/cms/home": "/",
  "/admin/cms/about": "/tentang",
  "/admin/cms/blog": "/blog",
  "/admin/cms/open-trip": "/open-trip",
  "/admin/cms/private-trip": "/private-trip",
  "/admin/cms/privacy": "/privacy-policy",
  // Footer tampil di semua halaman; beranda cukup untuk melihatnya.
  "/admin/cms/footer": "/",
  "/admin/open-trip": "/open-trip",
  "/admin/blog": "/blog",
}

export function adminPreviewUrl(pathname: string | null | undefined): string {
  if (!pathname) return "/"
  const path = pathname.replace(/\/+$/, "") || "/"
  if (EXACT[path]) return EXACT[path]

  // Edit paket / artikel → halaman detailnya.
  const trip = path.match(/^\/admin\/open-trip\/edit\/([^/]+)$/)
  if (trip) return `/open-trip/${trip[1]}`
  const post = path.match(/^\/admin\/blog\/([^/]+)\/edit$/)
  if (post) return `/blog/${post[1]}`

  // Halaman lain di bawah open-trip / blog (mis. "baru", kategori) → daftar publiknya.
  if (path.startsWith("/admin/open-trip")) return "/open-trip"
  if (path.startsWith("/admin/blog")) return "/blog"
  return "/"
}
