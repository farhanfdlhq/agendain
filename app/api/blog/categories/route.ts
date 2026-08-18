import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { checkCSRF, BlogCategorySchema, serverError } from '@/lib/security'

export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { nama: 'asc' },
      include: { _count: { select: { posts: true } } }
    })
    return NextResponse.json(categories)
  } catch (error) {
    return serverError('GET /api/blog/categories', error)
  }
}

export async function POST(request: Request) {
  if (!checkCSRF(request)) {
    return NextResponse.json({ error: 'CSRF Token Invalid' }, { status: 403 })
  }
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    if (!session || role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const result = BlogCategorySchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Validasi gagal', details: result.error.format() }, { status: 400 })
    }

    const data = result.data
    if (!data.slug) {
      data.slug = data.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }

    const category = await prisma.blogCategory.create({
      data: { nama: data.nama, namaEn: data.namaEn || null, slug: data.slug }
    })
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    return serverError('POST /api/blog/categories', error, { req: request })
  }
}
