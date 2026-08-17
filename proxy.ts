import { withAuth } from "next-auth/middleware"
import type { NextRequestWithAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 3,
  admin: 2,
  editor: 1,
}

// Menolak akses API + mencatat auth.denied ke audit log. Proxy Next 16 default
// runtime Node.js sehingga Prisma boleh dipakai; import DINAMIS wajib (proxy
// jalan tiap request) & fire-and-forget agar tak menunda respons. Hanya dipakai
// untuk penolakan API (bukan redirect /admin → login yang merupakan alur normal).
function deny(req: NextRequestWithAuth, status: number, code: string) {
  const token = req.nextauth?.token as
    | { role?: string; email?: string }
    | null
    | undefined
  void import("@/lib/error-log")
    .then((m) => {
      m.reportAuthDenied({
        route: `${req.method} ${req.nextUrl.pathname}`,
        status,
        code,
        req,
        actorEmail: token?.email ?? null,
        detail: { role: token?.role ?? null },
      })
    })
    .catch(() => {})
  return NextResponse.json(
    { error: status === 401 ? "Unauthorized" : "Forbidden" },
    { status },
  )
}

export default withAuth(
  function proxy(req) {
    const role = (req.nextauth.token?.role as string) || ''
    const path = req.nextUrl.pathname
    const method = req.method

    const userLevel = ROLE_HIERARCHY[role] !== undefined ? ROLE_HIERARCHY[role] : 0

    // ==========================================
    // 1. FRONTEND PROTECTIONS (/admin)
    // ==========================================

    // Redirect unauthenticated users
    if (path.startsWith('/admin') && path !== '/admin/login') {
      if (userLevel < 1) return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    // Super Admin Only Pages
    if (path.startsWith('/admin/settings/users') || path.startsWith('/admin/settings/design')) {
      if (userLevel < 3) return NextResponse.redirect(new URL('/admin', req.url))
    }

    // Admin Only Pages
    if (path.startsWith('/admin/booking') || path.startsWith('/admin/inquiries') || path.startsWith('/admin/cms')) {
      if (userLevel < 2) return NextResponse.redirect(new URL('/admin', req.url))
    }

    // ==========================================
    // 2. API PROTECTIONS (/api)
    // ==========================================

    // API Admin (Users profile/management)
    if (path.startsWith('/api/admin/users')) {
      if (userLevel < 3) return deny(req, 403, 'insufficient_role')
    }

    // API Open Trip (dulunya paket)
    if (path.startsWith('/api/open-trip')) {
      if (method === 'GET') return NextResponse.next()
      if (method === 'DELETE' && userLevel < 2) return deny(req, 403, 'insufficient_role')
      if (method !== 'GET' && userLevel < 1) return deny(req, 401, 'no_session')
    }

    // API Destinasi
    if (path.startsWith('/api/destinasi')) {
      if (method === 'GET') return NextResponse.next()
      if (userLevel < 1) return deny(req, 401, 'no_session')
    }

    // API Booking, Inquiries, Private Trip (Public POST, Protected GET/PUT/DELETE)
    if (path.startsWith('/api/booking') || path.startsWith('/api/inquiries') || path.startsWith('/api/private-trip')) {
      if (method === 'POST') return NextResponse.next()
      if (userLevel < 2) return deny(req, 403, 'insufficient_role')
    }

    // API Settings
    if (path.startsWith('/api/settings')) {
      if (method === 'GET') return NextResponse.next() // allowed for frontend layout
      if (userLevel < 3) return deny(req, 403, 'insufficient_role')
    }
  },
  {
    callbacks: {
      authorized: () => true // Allow middleware to process every matched route
    }
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/open-trip/:path*',
    '/api/booking/:path*',
    '/api/inquiries/:path*',
    '/api/private-trip/:path*',
    '/api/destinasi/:path*',
    '/api/admin/:path*',
    '/api/settings/:path*',
    '/api/upload/:path*'
  ]
}
