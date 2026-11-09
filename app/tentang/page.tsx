import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import TentangContent from './TentangContent'
import { pageMeta } from '@/lib/og'
import { JsonLd, breadcrumbLd } from '@/lib/jsonld'

export const revalidate = 60

// og:image = foto hero Tentang Kami yang sedang tayang (CMS `about_settings.heroImage`,
// bawaan /dest-swiss.webp seperti di TentangContent). Dulu menunjuk /tentang_hero.webp
// yang tidak ada, jadi kartu share jatuh ke gambar OG umum.
export async function generateMetadata(): Promise<Metadata> {
  let hero: string | undefined
  try {
    const row = await prisma.setting.findUnique({ where: { key: 'about_settings' } })
    if (row) hero = JSON.parse(row.value)?.heroImage || undefined
  } catch {}
  return pageMeta({
    title: 'Tentang Agendain | Travel Eropa dari Indonesia',
    description: 'Kenalan dengan Agendain: travel ke Eropa dari Indonesia yang dijalankan tour leader orang Indonesia yang tinggal di Italia.',
    path: '/tentang',
    image: hero || '/dest-swiss.webp',
  })
}

export default async function TentangPage() {
  let aboutSettings = {}
  try {
    const res = await prisma.setting.findUnique({ where: { key: 'about_settings' } })
    if (res) aboutSettings = JSON.parse(res.value)
  } catch (e) {
    console.error(e)
  }

  let recentPosts: any[] = []
  try {
    recentPosts = await prisma.blogPost.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      // Semua artikel terbit; halaman Tentang memecahnya 2 per halaman di klien.
      // Hanya field yang dipakai kartu (tanpa isi artikel) agar payload kecil.
      select: {
        id: true,
        slug: true,
        title: true,
        titleEn: true,
        excerpt: true,
        excerptEn: true,
        thumbnail: true,
        publishedAt: true,
        createdAt: true,
        category: { select: { nama: true, namaEn: true } },
      },
    })
  } catch (e) {
    console.error(e)
  }

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Beranda', path: '/' },
          { name: 'Tentang Kami', path: '/tentang' },
        ])}
      />
      <TentangContent aboutSettings={aboutSettings} recentPosts={recentPosts} />
    </>
  )
}
