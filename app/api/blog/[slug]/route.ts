import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { checkCSRF, BlogPostSchema, serverError } from '@/lib/security'

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params
    const { searchParams } = new URL(request.url)
    const preview = searchParams.get('preview') === 'true'

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: { category: true }
    })

    if (!post) return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 })

    // Draft hanya bisa dilihat jika preview=true + punya session admin
    if (post.status === 'draft' && !preview) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 })
    }
    if (post.status === 'draft' && preview) {
      const session = await getServerSession(authOptions)
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(post)
  } catch (error) {
    return serverError('GET /api/blog/[slug]', error)
  }
}

export async function PUT(request: Request, context: { params: Promise<{ slug: string }> }) {
  if (!checkCSRF(request)) {
    return NextResponse.json({ error: 'CSRF Token Invalid' }, { status: 403 })
  }
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    if (!session || role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { slug } = await context.params
    const existing = await prisma.blogPost.findUnique({ where: { slug } })
    if (!existing) return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 })

    const body = await request.json()
    const result = BlogPostSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Validasi gagal', details: result.error.format() }, { status: 400 })
    }

    const data = result.data
    // Set publishedAt saat pertama kali dipublish
    let publishedAt = existing.publishedAt
    if (data.status === 'published' && !existing.publishedAt) {
      publishedAt = new Date()
    }

    const post = await prisma.blogPost.update({
      where: { slug },
      data: { ...data, publishedAt }
    })
    return NextResponse.json(post)
  } catch (error) {
    return serverError('PUT /api/blog/[slug]', error, { req: request })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ slug: string }> }) {
  if (!checkCSRF(request)) {
    return NextResponse.json({ error: 'CSRF Token Invalid' }, { status: 403 })
  }
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    if (!session || role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { slug } = await context.params
    await prisma.blogPost.delete({ where: { slug } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return serverError('DELETE /api/blog/[slug]', error, { req: request })
  }
}
