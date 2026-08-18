import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { checkCSRF, BlogPostSchema, getClientIp, rateLimit, serverError } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const admin = searchParams.get('admin') === 'true'
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '12')))

    // Admin mode: require session
    if (admin) {
      const session = await getServerSession(authOptions)
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const where: any = {}
    if (!admin) where.status = 'published'
    if (category) where.category = { slug: category }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: { category: { select: { id: true, nama: true, namaEn: true, slug: true } } },
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.blogPost.count({ where })
    ])

    return NextResponse.json({ posts, total, page, pageSize })
  } catch (error) {
    return serverError('GET /api/blog', error)
  }
}

export async function POST(request: Request) {
  if (!checkCSRF(request)) {
    return NextResponse.json({ error: 'CSRF Token Invalid' }, { status: 403 })
  }

  const ip = getClientIp(request)
  const rl = rateLimit(ip, 10, 60000)
  if (!rl.success) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 })
  }

  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    if (!session || role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const result = BlogPostSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Validasi gagal', details: result.error.format() }, { status: 400 })
    }

    const data = result.data
    if (!data.slug) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }

    const post = await prisma.blogPost.create({
      data: {
        ...data,
        slug: data.slug,
        publishedAt: data.status === 'published' ? new Date() : null,
      }
    })
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    return serverError('POST /api/blog', error, { req: request })
  }
}
