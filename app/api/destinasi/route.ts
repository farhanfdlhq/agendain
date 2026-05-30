import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const destinations = await prisma.destinasi.findMany({
      orderBy: { nama: 'asc' }
    })
    return NextResponse.json(destinations)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch destinations' }, { status: 500 })
  }
}
