import TentangContent from './TentangContent'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'Tentang Kami | Agendain',
  description: 'Mengenal lebih dekat Agendain, partner perjalanan Eropa terpercaya Anda.',
}

export const revalidate = 60;

export default async function TentangPage() {
  let aboutSettings = {};
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'about_settings' } });
    if (setting) {
      aboutSettings = JSON.parse(setting.value);
    }
  } catch (error) {
    console.error('Failed to fetch about settings', error);
  }

  return <TentangContent aboutSettings={aboutSettings} />
}
