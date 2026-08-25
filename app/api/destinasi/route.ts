import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import { rateLimit, checkCSRF, DestinasiSchema, getClientIp, serverError } from '@/lib/security'

export async function GET() {
  try {
    const destinations = await prisma.destinasi.findMany({
      take: 100,
      orderBy: { nama: 'asc' },
      include: { _count: { select: { openTrips: true } } }
    })
    return NextResponse.json(destinations)
  } catch (error) {
    return serverError('GET /api/destinasi', error)
  }
}

export async function POST(request: Request) {
  // 1. CSRF Protection
  if (!checkCSRF(request)) {
    return NextResponse.json({ error: 'CSRF Token Invalid' }, { status: 403 })
  }

  // 2. Rate Limiting (Max 5 requests per minute per IP)
  const ip = getClientIp(request)
  const rateLimitResult = rateLimit(ip, 5, 60000)
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Too Many Requests. Please try again later.' }, { status: 429 })
  }

  try {
    const gate = await requirePermission(request, 'POST /api/destinasi', 'destinasi_create')
    if (gate.denied) return gate.denied

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
        namaEn: data.namaEn || null,
        slug: data.slug!,
        negara: data.negara,
        deskripsi: data.deskripsi,
        deskripsiEn: data.deskripsiEn || null,
        foto: data.foto,
        bahasa: data.bahasa || null,
        matauang: data.matauang || null,
        waktuTerbaik: data.waktuTerbaik || null,
        infoVisa: data.infoVisa || null,
      }
    })

    return NextResponse.json(newDest, { status: 201 })
  } catch (error) {
    return serverError('POST /api/destinasi', error, { req: request })
  }
}
