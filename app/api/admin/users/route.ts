import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRolesConfig, requirePermission } from "@/lib/rbac"
import bcrypt from 'bcryptjs'
import { AdminUserSchema, getClientIp, serverError } from "@/lib/security"
import { logAudit } from "@/lib/audit"

export async function GET(req: Request) {
  const gate = await requirePermission(req, 'GET /api/admin/users', 'users_manage')
  if (gate.denied) return gate.denied

  const users = await prisma.adminUser.findMany({
    select: { id: true, nama: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const gate = await requirePermission(req, 'POST /api/admin/users', 'users_manage')
  if (gate.denied) return gate.denied

  try {
    const result = AdminUserSchema.safeParse(await req.json())
    if (!result.success) {
      return NextResponse.json({ error: 'Validasi gagal', details: result.error.format() }, { status: 400 })
    }

    const data = result.data

    // Role divalidasi terhadap roles_config, bukan daftar id bawaan, supaya
    // role custom bisa ditetapkan — tapi id yang tidak ada tetap ditolak
    // (kalau lolos, usernya akan berakhir tanpa permission sama sekali).
    const roles = await getRolesConfig()
    if (!roles.some(r => r.id === data.role)) {
      return NextResponse.json({ error: `Role "${data.role}" tidak terdaftar.` }, { status: 400 })
    }

    const existing = await prisma.adminUser.findUnique({ where: { email: data.email } })
    if (existing) return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })

    const hashed = await bcrypt.hash(data.password, 10)
    const user = await prisma.adminUser.create({
      data: {
        nama: data.nama,
        email: data.email,
        password: hashed,
        role: data.role
      },
      select: { id: true, nama: true, email: true, role: true }
    })

    await logAudit({
      action: "user.create",
      actorId: gate.actor.userId,
      actorEmail: gate.actor.email,
      targetType: "AdminUser",
      targetId: user.id,
      detail: { email: data.email, role: data.role },
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent"),
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    return serverError('POST /api/admin/users', error, { req })
  }
}
