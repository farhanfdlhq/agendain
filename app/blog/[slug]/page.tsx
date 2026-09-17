import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import BlogDetailContent from './BlogDetailContent'
import { pageMeta } from '@/lib/og'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({ where: { slug }, include: { category: true } })
  if (!post || post.status !== 'published') return { title: 'Artikel Tidak Ditemukan' }

  // og:image = thumbnail/OG artikel itu sendiri (dilewatkan /og → JPG 1200x630).
  return pageMeta({
    title: post.metaTitle || `${post.title} | Agendain Blog`,
    description: post.metaDescription || post.excerpt,
    path: `/blog/${slug}`,
    image: post.ogImage || post.thumbnail,
  })
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({ where: { slug }, include: { category: true } })
  if (!post || post.status !== 'published') notFound()

  // Related posts: same category, exclude current, max 3
  const related = await prisma.blogPost.findMany({
    where: { categoryId: post.categoryId, status: 'published', slug: { not: slug } },
    take: 3,
    orderBy: { publishedAt: 'desc' },
    include: { category: true }
  })

  return <BlogDetailContent post={post} related={related} />
}
