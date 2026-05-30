import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const destinasi = searchParams.get('destinasi')
    
    const where: any = { status: 'published' }
    if (destinasi) {
      where.destinasi = { nama: { contains: destinasi } }
    }
    
    const packages = await prisma.paket.findMany({
      where,
      take: limit,
      include: { destinasi: true },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(packages)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
  }
}
