import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

/**
 * Proxy (nama Next 16 untuk middleware) HANYA mengurus AUTENTIKASI.
 *
 * Otorisasi — siapa boleh melakukan apa — ditegakkan di satu tempat lain:
 * `requirePermission()` (lib/rbac.ts) di dalam setiap route handler, plus
 * gerbang per-halaman di app/admin/layout.tsx. Keduanya membaca matriks
 * `permissions[]` dari `roles_config` dengan role diambil dari DB.
 *
 * Sebelumnya file ini punya mesin otorisasinya SENDIRI: ROLE_HIERARCHY
 * { super_admin: 3, admin: 2, editor: 1 } yang dibaca dari role di **JWT**.
 * Dua akibatnya fatal:
 *   1. Role custom tidak ada di hierarki itu → levelnya 0 → seluruh /admin
 *      di-redirect ke /admin/login dan setiap tulis ke /api/settings dijawab
 *      403 walau permission-nya lengkap. Ini sebab "role tidak bisa upload /
 *      tidak bisa menyimpan CMS" yang dilaporkan dari produksi.
 *   2. Role di JWT hanya ditulis saat sign-in, jadi perubahan role baru
 *      berlaku setelah user logout (bisa 30 hari).
 *
 * Jangan hidupkan lagi pengecekan role/permission di sini: satu mesin
 * otorisasi saja, dan mesin itu butuh DB yang tak boleh dibaca tiap request.
 */
export default withAuth(
  function proxy(req) {
    const path = req.nextUrl.pathname

    // Belum login → lempar ke halaman login. Halaman /admin adalah client
    // component, jadi tanpa penjagaan di tepi ini shell-nya sempat tampil
    // sebelum redirect di layout berjalan.
    if (path.startsWith("/admin") && path !== "/admin/login" && !req.nextauth.token) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  },
  {
    callbacks: {
      authorized: () => true, // biarkan proxy di atas yang memutuskan
    },
  },
)

// Hanya halaman admin. Route API TIDAK dicantumkan lagi: masing-masing sudah
// memanggil requirePermission() yang membalas 401 tanpa sesi dan 403 bila
// permission-nya kurang, sekaligus mencatatnya sebagai auth.denied di audit
// log. Mencantumkannya di sini berarti menyalin daftar "method mana yang
// publik" ke tempat kedua — sumber bug sebelumnya.
export const config = {
  matcher: ["/admin/:path*"],
}
