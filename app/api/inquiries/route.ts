import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, type, sudahDibalas } = body

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
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
