import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const pkg = await prisma.paket.findUnique({
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
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slug } = await params
    const data = await request.json()

    const updatedPackage = await prisma.paket.update({
      where: { slug },
      data: {
        ...(data.status && { status: data.status }),
        // @ts-ignore - Prisma types might not be generated yet
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
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slug } = await params
    const data = await request.json()
    
    if (!data.slug && data.nama) {
      data.slug = data.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }

    const updatedPackage = await prisma.paket.update({
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
        // @ts-ignore - Prisma types might not be generated yet
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
    await prisma.paket.delete({
      where: { slug }
    })

    return NextResponse.json({ message: 'Package deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 })
  }
}
