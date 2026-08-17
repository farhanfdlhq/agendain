import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { OpenTripSchema, serverError } from "@/lib/security"

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
    
    const packages = await prisma.openTrip.findMany({
      where,
      take: limit || 100,
      include: { destinasi: true },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(packages)
  } catch (error) {
    return serverError('GET /api/open-trip', error, { req: request })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    if (!session || !['super_admin', 'admin', 'editor'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized - Role required' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate with Zod
    const result = OpenTripSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Validasi gagal', details: result.error.format() }, { status: 400 })
    }
    
    const data = result.data

    // Auto-generate slug from name if not provided
    const generatedSlug = data.slug || data.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    const newPackage = await prisma.openTrip.create({
      data: {
        nama: data.nama,
        slug: generatedSlug,
        deskripsi: data.deskripsi,
        harga: Number(data.harga),
        durasi: Number(data.durasi),
        destinasiId: Number(data.destinasiId),
        foto: data.foto || {},
        itinerary: data.itinerary || [],
        fasilitas: data.fasilitas || [],
        termasuk: data.termasuk || [],
        tidakTermasuk: data.tidakTermasuk || [],
        status: data.status,
        label: data.label || null,
      }
    })

    return NextResponse.json(newPackage, { status: 201 })
  } catch (error) {
    return serverError('POST /api/open-trip', error, { req: request })
  }
}
