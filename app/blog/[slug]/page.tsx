import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import BlogDetailContent from './BlogDetailContent'
import { pageMeta } from '@/lib/og'
import { JsonLd, blogPostingLd, breadcrumbLd } from '@/lib/jsonld'
import { LOGO_BLUE } from '@/lib/site-logo'
import { RELATED_LIMIT, fillRelated } from '@/lib/blog-list'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({ where: { slug }, include: { category: true } })
  if (!post || post.status !== 'published') return { title: 'Artikel Tidak Ditemukan | Agendain', robots: { index: false, follow: false } }

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

  // Artikel terkait: kategori sama dulu, kekurangannya diisi artikel terbaru lain.
  const others = { status: 'published', slug: { not: slug } }
  const [sameCategory, latest] = await Promise.all([
    prisma.blogPost.findMany({
      where: { ...others, categoryId: post.categoryId },
      take: RELATED_LIMIT,
      orderBy: { publishedAt: 'desc' },
      include: { category: true },
    }),
    prisma.blogPost.findMany({
      where: { ...others, categoryId: { not: post.categoryId } },
      take: RELATED_LIMIT,
      orderBy: { publishedAt: 'desc' },
      include: { category: true },
    }),
  ])
  const related = fillRelated(sameCategory, latest)

  return (
    <>
      <JsonLd
        data={[
          blogPostingLd({
            title: post.title,
            description: post.metaDescription || post.excerpt,
            image: post.ogImage || post.thumbnail,
            path: `/blog/${slug}`,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            authorName: post.author,
            publisherName: 'Agendain',
            publisherLogo: LOGO_BLUE,
          }),
          breadcrumbLd([
            { name: 'Beranda', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: `/blog/${slug}` },
          ]),
        ]}
      />
      <BlogDetailContent post={post} related={related} />
    </>
  )
}
