import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const PaketSchema = z.object({
  nama: z.string().min(1, "Nama paket harus diisi"),
  slug: z.string().optional(),
  deskripsi: z.string().min(1, "Deskripsi harus diisi"),
  harga: z.coerce.number().positive("Harga harus lebih dari 0"),
  durasi: z.coerce.number().positive("Durasi harus lebih dari 0"),
  destinasiId: z.coerce.number().positive(),
  foto: z.any().optional(),
  itinerary: z.any().optional(),
  fasilitas: z.any().optional(),
  termasuk: z.any().optional(),
  tidakTermasuk: z.any().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional().default('draft'),
  label: z.string().nullable().optional(),
})

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
      take: limit || 100,
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

    const body = await request.json()
    
    // Validate with Zod
    const result = PaketSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Validasi gagal', details: result.error.format() }, { status: 400 })
    }
    
    const data = result.data

    // Auto-generate slug from name if not provided
    const generatedSlug = data.slug || data.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    const newPackage = await prisma.paket.create({
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
    console.error(error)
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 })
  }
}
