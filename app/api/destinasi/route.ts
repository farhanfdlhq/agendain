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

    const existing = await prisma.destinasi.findUnique({ where: { slug: data.slug! } })
    if (existing) {
      return NextResponse.json({ error: 'Destinasi dengan nama/slug ini sudah ada.' }, { status: 409 })
    }

    const newDest = await prisma.destinasi.create({
      data: {
        nama: data.nama,
        namaEn: data.namaEn || null,
        slug: data.slug!,
      }
    })

    return NextResponse.json(newDest, { status: 201 })
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') {
      return NextResponse.json({ error: 'Destinasi dengan nama/slug ini sudah ada.' }, { status: 409 })
    }
    return serverError('POST /api/destinasi', error, { req: request })
  }
}
