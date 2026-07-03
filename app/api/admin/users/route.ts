import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const users = await prisma.adminUser.findMany({
    select: { id: true, nama: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const data = await req.json()
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
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat user' }, { status: 500 })
  }
}
