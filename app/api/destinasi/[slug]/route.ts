import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { DestinasiSchema, serverError } from '@/lib/security'

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
    return serverError('GET /api/destinasi/[slug]', error, { req: request })
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
    const result = DestinasiSchema.safeParse(await request.json())
    if (!result.success) {
      return NextResponse.json({ error: 'Validasi gagal', details: result.error.format() }, { status: 400 })
    }
    const data = result.data
    
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
        negara: data.negara,
        bahasa: data.bahasa,
        matauang: data.matauang,
        waktuTerbaik: data.waktuTerbaik,
        infoVisa: data.infoVisa,
      }
    })

    return NextResponse.json(updatedDest)
  } catch (error) {
    return serverError('PUT /api/destinasi/[slug]', error, { req: request })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    if (!session || !['super_admin', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { slug } = await params
    await prisma.destinasi.delete({
      where: { slug }
    })

    return NextResponse.json({ message: 'Destinasi deleted successfully' })
  } catch (error) {
    return serverError('DELETE /api/destinasi/[slug]', error, { req: request })
  }
}
