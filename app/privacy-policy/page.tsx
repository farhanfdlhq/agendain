import { Metadata } from 'next'
import PrivacyPolicyContent from './PrivacyPolicyContent'

export const metadata: Metadata = {
  title: 'Privacy Policy | Agendain',
  description: 'Kebijakan privasi dan perlindungan data pelanggan Agendain.',
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />
}
