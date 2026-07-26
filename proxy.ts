import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 3,
  admin: 2,
  editor: 1,
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
      if (userLevel < 3) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // API Open Trip (dulunya paket)
    if (path.startsWith('/api/open-trip')) {
      if (method === 'GET') return NextResponse.next()
      if (method === 'DELETE' && userLevel < 2) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      if (method !== 'GET' && userLevel < 1) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // API Destinasi
    if (path.startsWith('/api/destinasi')) {
      if (method === 'GET') return NextResponse.next()
      if (userLevel < 1) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // API Booking, Inquiries, Private Trip (Public POST, Protected GET/PUT/DELETE)
    if (path.startsWith('/api/booking') || path.startsWith('/api/inquiries') || path.startsWith('/api/private-trip')) {
      if (method === 'POST') return NextResponse.next()
      if (userLevel < 2) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // API Settings
    if (path.startsWith('/api/settings')) {
      if (method === 'GET') return NextResponse.next() // allowed for frontend layout
      if (userLevel < 3) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
