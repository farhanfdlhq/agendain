import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { InquiryUpdateSchema, isAllowedRole, serverError } from '@/lib/security'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    if (!session || !isAllowedRole(role, ['super_admin', 'admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const inquiries = await prisma.inquiry.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: { openTrip: { select: { nama: true } } }
    })
    
    const privateTrips = await prisma.privateTrip.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ inquiries, privateTrips })
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

    const result = InquiryUpdateSchema.safeParse(await request.json())
    if (!result.success) {
      return NextResponse.json({ error: 'Validasi gagal', details: result.error.format() }, { status: 400 })
    }
    const { id, type, sudahDibalas } = result.data

    if (type === 'inquiry') {
      await prisma.inquiry.update({
        where: { id },
        data: { sudahDibalas }
      })
    } else if (type === 'privatetrip') {
      await prisma.privateTrip.update({
        where: { id },
        data: { status: sudahDibalas ? 'replied' : 'new' }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return serverError('PUT /api/inquiries', error, { req: request })
  }
}
