import { prisma } from '@/lib/prisma'
import BlogContent from './BlogContent'

export const revalidate = 60

export const metadata = {
  title: 'Blog & Travel Tips | Agendain',
  description: 'Temukan inspirasi liburan impianmu, tips perjalanan praktis, dan cerita seru dari Kawan Agendain.',
}

export default async function BlogPage() {
  let blogSettings = {}
  try {
    const res = await prisma.setting.findUnique({ where: { key: 'blog_settings' } })
    if (res) blogSettings = JSON.parse(res.value)
  } catch (e) {
    console.error(e)
  }

  return <BlogContent blogSettings={blogSettings} />
}
