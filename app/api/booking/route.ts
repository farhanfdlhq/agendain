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

    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        paket: { 
          select: { nama: true } 
        } 
      }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Failed to fetch bookings", error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
