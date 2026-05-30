import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const destinasi = searchParams.get('destinasi')
    
    // If logged in, fetch all. If public, fetch only published
    const where: any = {}
    if (!session) {
      where.status = 'published'
    }

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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Auto-generate slug from name if not provided
    if (!data.slug && data.nama) {
      data.slug = data.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }

    const newPackage = await prisma.paket.create({
      data: {
        nama: data.nama,
        slug: data.slug,
        deskripsi: data.deskripsi,
        harga: data.harga,
        durasi: data.durasi,
        destinasiId: data.destinasiId,
        foto: data.foto || {},
        itinerary: data.itinerary || [],
        fasilitas: data.fasilitas || [],
        termasuk: data.termasuk || [],
        tidakTermasuk: data.tidakTermasuk || [],
        status: data.status || 'draft',
      }
    })

    return NextResponse.json(newPackage, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 })
  }
}
