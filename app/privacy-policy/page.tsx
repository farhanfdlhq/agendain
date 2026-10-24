import { Metadata } from 'next'
import PrivacyPolicyContent from './PrivacyPolicyContent'
import { prisma } from '@/lib/prisma'
import { pageMeta } from '@/lib/og'
import { JsonLd, breadcrumbLd } from '@/lib/jsonld'

export const metadata: Metadata = pageMeta({
  title: 'Kebijakan Privasi | Agendain',
  description: 'Kebijakan privasi dan perlindungan data pelanggan biro perjalanan wisata Agendain.',
  path: '/privacy-policy',
})

export const revalidate = 60;

export default async function PrivacyPolicyPage() {
  let privacySettings = {};
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'privacy_settings' } });
    if (setting) {
      privacySettings = JSON.parse(setting.value);
    }
  } catch (error) {
    console.error('Failed to fetch privacy settings', error);
  }

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Beranda', path: '/' },
          { name: 'Kebijakan Privasi', path: '/privacy-policy' },
        ])}
      />
      <PrivacyPolicyContent privacySettings={privacySettings} />
    </>
  )
}
