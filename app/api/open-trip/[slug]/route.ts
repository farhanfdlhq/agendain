import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { OpenTripPatchSchema, OpenTripSchema } from "@/lib/security"

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
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    if (!session || !['super_admin', 'admin', 'editor'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    if (!session || !['super_admin', 'admin', 'editor'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const result = OpenTripSchema.safeParse(await request.json())
    if (!result.success) {
      return NextResponse.json({ error: 'Validasi gagal', details: result.error.format() }, { status: 400 })
    }
    const data = result.data
    
    if (!data.slug && data.nama) {
      data.slug = data.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }

    const updatedPackage = await prisma.openTrip.update({
      where: { slug },
      data: {
        nama: data.nama,
        slug: data.slug,
        deskripsi: data.deskripsi,
        harga: Number(data.harga),
        durasi: Number(data.durasi),
        destinasiId: Number(data.destinasiId),
        foto: data.foto,
        itinerary: data.itinerary,
        fasilitas: data.fasilitas,
        termasuk: data.termasuk,
        tidakTermasuk: data.tidakTermasuk,
        status: data.status,
        label: data.label,
      }
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
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const role = (session.user as any)?.role
    if (role !== 'admin' && role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { slug } = await params
    await prisma.openTrip.delete({
      where: { slug }
    })

    return NextResponse.json({ message: 'Package deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 })
  }
}
