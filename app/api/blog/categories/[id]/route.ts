import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import { checkCSRF, BlogCategorySchema, serverError } from '@/lib/security'

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!checkCSRF(request)) {
    return NextResponse.json({ error: 'CSRF Token Invalid' }, { status: 403 })
  }
  try {
    const gate = await requirePermission(request, 'PUT /api/blog/categories/[id]', 'blog_edit')
    if (gate.denied) return gate.denied

    const { id } = await context.params
    const body = await request.json()
    const result = BlogCategorySchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Validasi gagal', details: result.error.format() }, { status: 400 })
    }

    const data = result.data
    if (!data.slug) {
      data.slug = data.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }

    const category = await prisma.blogCategory.update({
      where: { id: parseInt(id) },
      data: { nama: data.nama, namaEn: data.namaEn || null, slug: data.slug }
    })
    return NextResponse.json(category)
  } catch (error) {
    return serverError('PUT /api/blog/categories/[id]', error, { req: request })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!checkCSRF(request)) {
    return NextResponse.json({ error: 'CSRF Token Invalid' }, { status: 403 })
  }
  try {
    const gate = await requirePermission(request, 'DELETE /api/blog/categories/[id]', 'blog_delete')
    if (gate.denied) return gate.denied

    const { id } = await context.params
    const postCount = await prisma.blogPost.count({ where: { categoryId: parseInt(id) } })
    if (postCount > 0) {
      return NextResponse.json({ error: `Kategori masih memiliki ${postCount} artikel. Pindahkan artikel terlebih dahulu.` }, { status: 400 })
    }

    await prisma.blogCategory.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return serverError('DELETE /api/blog/categories/[id]', error, { req: request })
  }
}
