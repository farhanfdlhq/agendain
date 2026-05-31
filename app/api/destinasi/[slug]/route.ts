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
    const dest = await prisma.destinasi.findUnique({
      where: { slug }
    })
    
    if (!dest) {
      return NextResponse.json({ error: 'Destinasi not found' }, { status: 404 })
    }
    
    return NextResponse.json(dest)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch destinasi' }, { status: 500 })
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

    const updatedDest = await prisma.destinasi.update({
      where: { slug },
      data: {
        nama: data.nama,
        slug: data.slug,
        deskripsi: data.deskripsi,
        foto: data.foto,
      }
    })

    return NextResponse.json(updatedDest)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update destinasi' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slug } = await params
    await prisma.destinasi.delete({
      where: { slug }
    })

    return NextResponse.json({ message: 'Destinasi deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete destinasi' }, { status: 500 })
  }
}
