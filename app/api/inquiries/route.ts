import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrivateTripStatusUpdateSchema, isAllowedRole, serverError } from '@/lib/security'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    if (!session || !isAllowedRole(role, ['super_admin', 'admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const privateTrips = await prisma.privateTrip.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ privateTrips })
  } catch (error) {
    return serverError('GET /api/inquiries', error)
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    if (!session || !isAllowedRole(role, ['super_admin', 'admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = PrivateTripStatusUpdateSchema.safeParse(await request.json())
    if (!result.success) {
      return NextResponse.json({ error: 'Validasi gagal', details: result.error.format() }, { status: 400 })
    }
    const { id, status } = result.data

    // updateMany, bukan update: baris yang sudah dihapus admin lain tidak
    // melempar P2025 tapi mengembalikan count 0 → dijawab 404 yang jelas.
    const updated = await prisma.privateTrip.updateMany({
      where: { id },
      data: { status },
    })

    if (updated.count === 0) {
      return NextResponse.json({ error: 'Permintaan tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ success: true, status })
  } catch (error) {
    return serverError('PUT /api/inquiries', error, { req: request })
  }
}
