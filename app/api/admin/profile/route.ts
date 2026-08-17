import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { ProfileUpdateSchema, getClientIp } from '@/lib/security'
import { logAudit } from '@/lib/audit'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.adminUser.findUnique({
    where: { email: session.user.email },
    select: { id: true, nama: true, email: true, role: true, avatar: true }
  })
  return NextResponse.json(user)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = ProfileUpdateSchema.safeParse(await req.json())
  if (!result.success) {
    return NextResponse.json({ error: 'Validasi gagal', details: result.error.format() }, { status: 400 })
  }

  const body = result.data
  const { nama, email, currentPassword, newPassword, avatar } = body

  const user = await prisma.adminUser.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const updateData: any = {}
  if (nama) updateData.nama = nama
  if (avatar !== undefined) updateData.avatar = avatar
  if (email && email !== user.email) {
    const existing = await prisma.adminUser.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 })
    updateData.email = email
  }
  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: 'Password lama wajib diisi' }, { status: 400 })
    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) return NextResponse.json({ error: 'Password lama salah' }, { status: 400 })
    updateData.password = await bcrypt.hash(newPassword, 10)
  }

  const updated = await prisma.adminUser.update({
    where: { id: user.id },
    data: updateData,
    select: { id: true, nama: true, email: true, role: true }
  })

  const ip = getClientIp(req)
  const userAgent = req.headers.get("user-agent")
  await logAudit({
    action: "profile.update",
    actorId: user.id,
    actorEmail: user.email,
    targetType: "AdminUser",
    targetId: user.id,
    detail: { emailChanged: !!(email && email !== user.email) },
    ip, userAgent,
  })
  if (updateData.password) {
    await logAudit({
      action: "profile.password_change",
      actorId: user.id,
      actorEmail: user.email,
      targetType: "AdminUser",
      targetId: user.id,
      ip, userAgent,
    })
  }

  return NextResponse.json(updated)
}
