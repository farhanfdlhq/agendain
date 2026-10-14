import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import BlogContent from './BlogContent'
import {
  blogListHref,
  blogPageCount,
  blogPageWindow,
  hasFeatured,
  parseBlogQuery,
  readMinutes,
} from '@/lib/blog-list'

export const revalidate = 60

type SearchParams = Promise<Record<string, string | string[] | undefined>>

const TITLE = 'Blog & Travel Tips | Agendain'
const DESCRIPTION = 'Temukan inspirasi liburan impianmu, tips perjalanan praktis, dan cerita seru dari Kawan Agendain.'

// Halaman 2, 3, … = konten berbeda → canonical ke dirinya sendiri (dirayapi &
// diindeks). Filter kategori/pencarian = potongan daftar yang sama → canonical
// ke /blog; hasil pencarian juga noindex agar tak jadi URL tipis di indeks.
export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const query = parseBlogQuery(await searchParams)
  const filtered = !hasFeatured(query)
  const canonical = filtered ? '/blog' : blogListHref({ page: query.page }, false)
  return {
    title: !filtered && query.page > 1 ? `Blog & Travel Tips — Halaman ${query.page} | Agendain` : TITLE,
    description: DESCRIPTION,
    alternates: { canonical },
    ...(query.q ? { robots: { index: false, follow: true } } : {}),
  }
}

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const query = parseBlogQuery(await searchParams)

  let blogSettings = {}
  try {
    const res = await prisma.setting.findUnique({ where: { key: 'blog_settings' } })
    if (res) blogSettings = JSON.parse(res.value)
  } catch (e) {
    console.error(e)
  }

  const categories = await prisma.blogCategory.findMany({
    orderBy: { nama: 'asc' },
    select: { id: true, nama: true, namaEn: true, slug: true },
  })
  // Slug kategori tak dikenal diperlakukan seperti "Semua".
  const kategori = categories.some((c) => c.slug === query.kategori) ? query.kategori : null

  const where = {
    status: 'published',
    ...(kategori ? { category: { slug: kategori } } : {}),
    // Tiap kata harus muncul (di judul/ringkasan, ID atau EN), urutan bebas:
    // "paris musim dingin" tetap menemukan "Musim Dingin di Paris".
    ...(query.q
      ? {
          AND: query.q.split(/\s+/).slice(0, 5).map((word) => ({
            OR: [
              { title: { contains: word } },
              { titleEn: { contains: word } },
              { excerpt: { contains: word } },
              { excerptEn: { contains: word } },
            ],
          })),
        }
      : {}),
  }

  const featured = hasFeatured({ kategori, q: query.q })
  const total = await prisma.blogPost.count({ where })
  const pageCount = blogPageCount(total, featured)
  // Halaman di luar jangkauan (mis. ?page=99 setelah artikel dihapus) → 404,
  // bukan halaman kosong ber-canonical sendiri.
  if (query.page > pageCount) notFound()
  const page = query.page
  const { skip, take } = blogPageWindow(page, featured)

  const rows = await prisma.blogPost.findMany({
    where,
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    skip,
    take,
    select: {
      id: true,
      title: true,
      titleEn: true,
      slug: true,
      excerpt: true,
      excerptEn: true,
      thumbnail: true,
      publishedAt: true,
      createdAt: true,
      content: true,
      contentEn: true,
      category: { select: { id: true, nama: true, namaEn: true, slug: true } },
    },
  })

  // Isi artikel hanya dipakai untuk menit baca — dihitung di server agar
  // HTML lengkap tiap artikel tidak ikut terkirim ke browser.
  const posts = rows.map(({ content, contentEn, publishedAt, createdAt, ...p }) => ({
    ...p,
    date: (publishedAt ?? createdAt).toISOString(),
    readMin: readMinutes(content),
    readMinEn: contentEn ? readMinutes(contentEn) : null,
  }))

  return (
    <BlogContent
      blogSettings={blogSettings}
      categories={categories}
      posts={posts}
      featured={featured && page === 1}
      total={total}
      page={page}
      pageCount={pageCount}
      kategori={kategori}
      q={query.q}
    />
  )
}
