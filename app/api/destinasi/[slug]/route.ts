import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
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
    const gate = await requirePermission(request, 'PUT /api/destinasi/[slug]', 'destinasi_edit')
    if (gate.denied) return gate.denied

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
        namaEn: data.namaEn || null,
        slug: data.slug,
        deskripsi: data.deskripsi,
        deskripsiEn: data.deskripsiEn || null,
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
    const gate = await requirePermission(request, 'DELETE /api/destinasi/[slug]', 'destinasi_delete')
    if (gate.denied) return gate.denied

    const { slug } = await params
    await prisma.destinasi.delete({
      where: { slug }
    })

    return NextResponse.json({ message: 'Destinasi deleted successfully' })
  } catch (error) {
    return serverError('DELETE /api/destinasi/[slug]', error, { req: request })
  }
}
