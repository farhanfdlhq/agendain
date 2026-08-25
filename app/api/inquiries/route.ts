import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import { PrivateTripStatusUpdateSchema, serverError } from '@/lib/security'

export async function GET() {
  try {
    const gate = await requirePermission(undefined, 'GET /api/inquiries', 'inquiry_view')
    if (gate.denied) return gate.denied

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
    const gate = await requirePermission(request, 'PUT /api/inquiries', 'inquiry_edit')
    if (gate.denied) return gate.denied

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
