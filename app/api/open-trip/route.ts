import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { requirePermission, resolveActor, hasPermission } from '@/lib/rbac'
import { OpenTripSchema, serverError } from "@/lib/security"
import { slugifyNama, toOpenTripData } from "@/lib/open-trip-fields"
import { PUBLISHED_OPEN_TRIP } from "@/lib/open-trip-card"
import { revalidateOpenTrips } from "@/lib/revalidate-open-trips"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const actor = await resolveActor(session)
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const destinasi = searchParams.get('destinasi')
    
    // Login saja tidak memberikan hak untuk membaca draft.
    const where: any = {}
    if (!hasPermission(actor, 'paket_view', 'paket_edit')) {
      where.status = PUBLISHED_OPEN_TRIP.status
    }

    if (destinasi) {
      where.destinasi = { nama: { contains: destinasi } }
    }
    
    const packages = await prisma.openTrip.findMany({
      where,
      take: Number.isFinite(limit) ? Math.min(100, Math.max(1, limit!)) : 100,
      include: { destinasi: true },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(packages, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return serverError('GET /api/open-trip', error, { req: request })
  }
}

export async function POST(request: Request) {
  try {
    const gate = await requirePermission(request, 'POST /api/open-trip', 'paket_create')
    if (gate.denied) return gate.denied

    const body = await request.json()
    
    // Validate with Zod
    const result = OpenTripSchema.safeParse(body)
    if (!result.success) {
      console.error('POST /api/open-trip validasi gagal:', JSON.stringify(result.error.flatten().fieldErrors))
      return NextResponse.json({ error: 'Validasi gagal', details: result.error.flatten().fieldErrors }, { status: 400 })
    }
    
    const data = result.data

    // Auto-generate slug from name if not provided
    const generatedSlug = data.slug || slugifyNama(data.nama)

    const newPackage = await prisma.openTrip.create({
      data: {
        ...toOpenTripData(data, 'create'),
        slug: generatedSlug,
      } as any
    })

    revalidateOpenTrips()
    return NextResponse.json(newPackage, { status: 201 })
  } catch (error) {
    return serverError('POST /api/open-trip', error, { req: request })
  }
}
