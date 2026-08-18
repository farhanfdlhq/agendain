import { prisma } from '@/lib/prisma'
import TentangContent from './TentangContent'

export const revalidate = 60

export const metadata = {
  title: 'Tentang Kami | Agendain',
  description: 'Mengenal lebih dekat Agendain, teman perjalanan Eropa Anda.',
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
      take: 3,
      include: { category: true }
    })
  } catch (e) {
    console.error(e)
  }

  return <TentangContent aboutSettings={aboutSettings} recentPosts={recentPosts} />
}
