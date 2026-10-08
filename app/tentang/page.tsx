import { prisma } from '@/lib/prisma'
import TentangContent from './TentangContent'

export const revalidate = 60

export const metadata = {
  title: 'Tentang Kami | Agendain',
  description: 'Mengenal lebih dekat Agendain, teman perjalanan Eropa Anda.',
  alternates: { canonical: '/tentang' },
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

  return <TentangContent aboutSettings={aboutSettings} recentPosts={recentPosts} />
}
