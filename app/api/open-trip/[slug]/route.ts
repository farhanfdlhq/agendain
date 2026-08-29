import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import { OpenTripPatchSchema, OpenTripSchema } from "@/lib/security"
import { slugifyNama, toOpenTripData } from "@/lib/open-trip-fields"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const pkg = await prisma.openTrip.findUnique({
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const gate = await requirePermission(request, 'PATCH /api/open-trip/[slug]', 'paket_edit')
    if (gate.denied) return gate.denied

    const { slug } = await params
    const result = OpenTripPatchSchema.safeParse(await request.json())
    if (!result.success) {
      return NextResponse.json({ error: 'Validasi gagal', details: result.error.format() }, { status: 400 })
    }
    const data = result.data

    const updatedPackage = await prisma.openTrip.update({
      where: { slug },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.label !== undefined && { label: data.label }),
      }
    })

    return NextResponse.json(updatedPackage)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to patch package' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const gate = await requirePermission(request, 'PUT /api/open-trip/[slug]', 'paket_edit')
    if (gate.denied) return gate.denied

    const { slug } = await params
    const result = OpenTripSchema.safeParse(await request.json())
    if (!result.success) {
      // Dicatat server-side agar kegagalan validasi bisa didiagnosis dari log
      // (audit log hanya mencatat event auth, bukan validasi paket).
      console.error('PUT /api/open-trip validasi gagal:', slug, JSON.stringify(result.error.flatten().fieldErrors))
      return NextResponse.json({ error: 'Validasi gagal', details: result.error.flatten().fieldErrors }, { status: 400 })
    }
    const data = result.data

    if (!data.slug && data.nama) {
      data.slug = slugifyNama(data.nama)
    }

    const updatedPackage = await prisma.openTrip.update({
      where: { slug },
      data: {
        ...toOpenTripData(data, 'update'),
        slug: data.slug,
      } as any
    })

    return NextResponse.json(updatedPackage)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const gate = await requirePermission(request, 'DELETE /api/open-trip/[slug]', 'paket_delete')
    if (gate.denied) return gate.denied

    const { slug } = await params
    await prisma.openTrip.delete({
      where: { slug }
    })

    return NextResponse.json({ message: 'Package deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 })
  }
}
