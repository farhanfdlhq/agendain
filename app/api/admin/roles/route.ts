import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getClientIp, serverError } from "@/lib/security"
import { logAudit } from "@/lib/audit"
import { reportServerError } from "@/lib/error-log"

const DEFAULT_ROLES = [
  { id: 'super_admin', name: 'Super Admin', description: 'Akses penuh ke semua fitur sistem', permissions: ['all'] },
  { id: 'admin', name: 'Administrator', description: 'Mengelola pesanan, inquiry, dan konten wisata', permissions: [
    'paket_view', 'paket_create', 'paket_edit', 'paket_delete',
    'destinasi_view', 'destinasi_create', 'destinasi_edit', 'destinasi_delete',
    'booking_view', 'booking_create', 'booking_edit', 'booking_delete',
    'inquiry_view', 'inquiry_edit', 'inquiry_delete',
    'cms_manage'
  ] },
  { id: 'editor', name: 'Editor', description: 'Hanya dapat mengelola paket dan destinasi', permissions: [
    'paket_view', 'paket_create', 'paket_edit',
    'destinasi_view', 'destinasi_create', 'destinasi_edit',
    'cms_manage'
  ] }
]

export async function GET() {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const setting = await prisma.$queryRaw`SELECT * FROM Setting WHERE \`key\` = 'roles_config'` as any[]
  const users = await prisma.adminUser.findMany({ select: { role: true } })
  
  let roles = DEFAULT_ROLES
  if (setting && setting.length > 0) {
    try {
      const parsedRoles = JSON.parse(setting[0].value)
      // Migration check: if permissions use the old format (no underscore), discard and use default
      const hasOldFormat = parsedRoles.some((r: any) => 
        r.permissions.some((p: string) => !p.includes('_') && p !== 'all')
      )
      
      if (!hasOldFormat) {
        roles = parsedRoles
      }
    } catch (e) {
      // Data roles_config rusak/tidak valid JSON — pakai DEFAULT_ROLES (fallback
      // aman, bukan 500), tetapi catat agar korupsi data ini terlihat.
      reportServerError({ route: "GET /api/admin/roles", code: "roles_read_failed" }, e)
    }
  }

  const rolesWithCount = roles.map(r => ({
    ...r,
    userCount: users.filter(u => u.role === r.id).length
  }))

  return NextResponse.json(rolesWithCount)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const newRoles = await req.json()
    const value = JSON.stringify(newRoles)
    
    await prisma.$executeRaw`
      INSERT INTO Setting (\`key\`, value)
      VALUES ('roles_config', ${value})
      ON DUPLICATE KEY UPDATE value = ${value}
    `

    await logAudit({
      action: "role.update",
      actorId: Number((session?.user as any)?.id),
      actorEmail: (session?.user as any)?.email,
      targetType: "Setting",
      targetId: "roles_config",
      detail: { roleNames: Array.isArray(newRoles) ? newRoles.map((r: any) => r?.name) : null },
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent"),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return serverError('POST /api/admin/roles', error, { req })
  }
}
