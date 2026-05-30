import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const pkg = await prisma.paket.findUnique({
      where: { slug },
      include: { destinasi: true }
    })
    
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }
    
    return NextResponse.json(pkg)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch package details' }, { status: 500 })
  }
}
