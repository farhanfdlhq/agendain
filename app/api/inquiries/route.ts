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
      orderBy: { createdAt: 'desc' },
      include: { paket: { select: { nama: true } } }
    })
    
    const privateTrips = await prisma.privateTrip.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ inquiries, privateTrips })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 })
  }
}
