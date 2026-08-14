import { Metadata } from 'next'
import PrivacyPolicyContent from './PrivacyPolicyContent'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Privacy Policy | Agendain',
  description: 'Kebijakan privasi dan perlindungan data pelanggan Agendain.',
}

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

  return <PrivacyPolicyContent privacySettings={privacySettings} />
}
