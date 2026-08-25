import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { requirePermission } from '@/lib/rbac'
import { OpenTripSchema, serverError } from "@/lib/security"
import { slugifyNama, toOpenTripData } from "@/lib/open-trip-fields"

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
    const gate = await requirePermission(request, 'POST /api/open-trip', 'paket_create')
    if (gate.denied) return gate.denied

    const body = await request.json()
    
    // Validate with Zod
    const result = OpenTripSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Validasi gagal', details: result.error.format() }, { status: 400 })
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

    return NextResponse.json(newPackage, { status: 201 })
  } catch (error) {
    return serverError('POST /api/open-trip', error, { req: request })
  }
}
