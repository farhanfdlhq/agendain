'use client'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { generateWhatsAppLink } from '@/lib/utils'
import type { OpenTripCardData } from '@/lib/open-trip-card'
import type { CmsRow } from '@/lib/types/cms'
import type { Gs, HomeSettings, Tr } from './types'

import HeroSection from './sections/HeroSection'
import WhySection from './sections/WhySection'
import DestinationsSection from './sections/DestinationsSection'
import TestimonialSection from './sections/TestimonialSection'
import AccordionSection from './sections/AccordionSection'
import SocialProofSection from './sections/SocialProofSection'
import FaqSection from './sections/FaqSection'

const getTestimonials = (t: Tr): CmsRow[] => [
  {
    name: t('home.testi.name1'),
    text: t('home.testi.text1'),
    photo: '/el-rumi-syifa.webp'
  },
  {
    name: t('home.testi.name2'),
    text: t('home.testi.text2'),
    photo: '/dest-france.webp'
  },
  {
    name: t('home.testi.name3'),
    text: t('home.testi.text3'),
    photo: '/dest-swiss.webp'
  },
]

export default function HomeContent({
  packages,
  homeSettings,
}: {
  packages: OpenTripCardData[]
  homeSettings: HomeSettings
}) {
  const { t, locale } = useTranslation()
  const testimonials = getTestimonials(t)
  // Nilai teks dari setting; selain string dianggap kosong.
  const str = (k: string) => {
    const v = homeSettings?.[k]
    return typeof v === 'string' ? v : typeof v === 'number' ? String(v) : ''
  }
  const waLink = generateWhatsAppLink(str('whatsapp_number'), str('whatsapp_message'))

  const gs: Gs = (key, fallbackTKey, defaultStatic) => {
    const dataKey = locale === 'en' ? `${key}_en` : key;
    if (str(dataKey).trim() !== '') return str(dataKey);
    if (str(key).trim() !== '') return str(key);
    if (fallbackTKey) return t(fallbackTKey);
    return defaultStatic || '';
  }

  const orderArray = (str('sectionOrder') || 'hero,why,destinations,testimonial,accordion,socialproof,faq').split(',')

  const renderSection = (key: string) => {
    switch (key.trim()) {
      case 'hero': 
        return <HeroSection key="hero" gs={gs} t={t} waLink={waLink} />
      case 'why': 
        return <WhySection key="why" gs={gs} t={t} locale={locale} homeSettings={homeSettings} />
      case 'destinations':
        // Tanpa paket terbit, section ini hanya judul + tombol kosong → disembunyikan.
        return packages.length > 0 ? <DestinationsSection key="destinations" gs={gs} packages={packages} /> : null
      case 'testimonial': 
        return <TestimonialSection key="testimonial" gs={gs} t={t} waLink={waLink} locale={locale} homeSettings={homeSettings} />
      case 'accordion': 
        return <AccordionSection key="accordion" gs={gs} t={t} locale={locale} homeSettings={homeSettings} />
      case 'socialproof': 
        return <SocialProofSection key="socialproof" gs={gs} t={t} locale={locale} homeSettings={homeSettings} testimonials={testimonials} />
      case 'faq': 
        return <FaqSection key="faq" gs={gs} t={t} locale={locale} homeSettings={homeSettings} waLink={waLink} />
      default: 
        return null
    }
  }

  return (
    <>
      {orderArray.map((key: string) => renderSection(key))}
    </>
  )
}
