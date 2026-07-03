import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import bcrypt from 'bcryptjs'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { id } = await params
    const data = await req.json()
    const updateData: any = {
      nama: data.nama,
      email: data.email,
      role: data.role
    }

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10)
    }

    // Check email uniqueness if changed
    if (data.email) {
      const existing = await prisma.adminUser.findFirst({
        where: { email: data.email, NOT: { id: Number(id) } }
      })
      if (existing) return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    }

    const user = await prisma.adminUser.update({
      where: { id: Number(id) },
      data: updateData,
      select: { id: true, nama: true, email: true, role: true }
    })
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update user' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { id } = await params
    
    // Cegah hapus diri sendiri
    if ((session?.user as any)?.id === id) {
      return NextResponse.json({ error: 'Tidak dapat menghapus akun sendiri' }, { status: 400 })
    }
    
    await prisma.adminUser.delete({
      where: { id: Number(id) }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal hapus user' }, { status: 500 })
  }
}
