import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { rateLimit, checkCSRF } from '@/lib/security'

const DestinasiSchema = z.object({
  nama: z.string().min(1, "Nama destinasi harus diisi"),
  slug: z.string().optional(),
  negara: z.string().min(1, "Negara harus diisi"),
  deskripsi: z.string().min(1, "Deskripsi harus diisi"),
  foto: z.string().min(1, "Foto harus diisi"),
  bahasa: z.string().optional().nullable(),
  matauang: z.string().optional().nullable(),
  waktuTerbaik: z.string().optional().nullable(),
  infoVisa: z.string().optional().nullable(),
})

export async function GET() {
  try {
    const destinations = await prisma.destinasi.findMany({
      take: 100,
      orderBy: { nama: 'asc' },
      include: { _count: { select: { openTrips: true } } }
    })
    return NextResponse.json(destinations)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch destinations' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  // 1. CSRF Protection
  if (!checkCSRF(request)) {
    return NextResponse.json({ error: 'CSRF Token Invalid' }, { status: 403 })
  }

  // 2. Rate Limiting (Max 5 requests per minute per IP)
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  const rateLimitResult = rateLimit(ip, 5, 60000)
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Too Many Requests. Please try again later.' }, { status: 429 })
  }

  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    if (!session || !['super_admin', 'admin', 'editor'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const result = DestinasiSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Validasi gagal', details: result.error.format() }, { status: 400 })
    }
    
    const data = result.data
    
    if (!data.slug && data.nama) {
      data.slug = data.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }

    const newDest = await prisma.destinasi.create({
      data: {
        nama: data.nama,
        slug: data.slug!,
        negara: data.negara,
        deskripsi: data.deskripsi,
        foto: data.foto,
        bahasa: data.bahasa || null,
        matauang: data.matauang || null,
        waktuTerbaik: data.waktuTerbaik || null,
        infoVisa: data.infoVisa || null,
      }
    })

    return NextResponse.json(newDest, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create destination' }, { status: 500 })
  }
}
