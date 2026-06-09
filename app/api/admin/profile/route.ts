import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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

  const body = await req.json()
  const { nama, email, currentPassword, newPassword } = body

  const user = await prisma.adminUser.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const updateData: any = {}
  if (nama) updateData.nama = nama
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
  return NextResponse.json(updated)
}
