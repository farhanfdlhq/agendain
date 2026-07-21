'use client'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { generateWhatsAppLink } from '@/lib/utils'

import HeroSection from './sections/HeroSection'
import WhySection from './sections/WhySection'
import DestinationsSection from './sections/DestinationsSection'
import TestimonialSection from './sections/TestimonialSection'
import AccordionSection from './sections/AccordionSection'
import SocialProofSection from './sections/SocialProofSection'
import FaqSection from './sections/FaqSection'

const getTestimonials = (t: any) => [
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
  destinations,
  homeSettings,
}: {
  packages: any[]
  destinations: any[]
  homeSettings: any
}) {
  const { t, locale } = useTranslation()
  const testimonials = getTestimonials(t)
  const waLink = generateWhatsAppLink(homeSettings?.whatsapp_number, homeSettings?.whatsapp_message)

  const gs = (key: string, fallbackTKey?: string, defaultStatic?: string) => {
    const dataKey = locale === 'en' ? `${key}_en` : key;
    if (homeSettings?.[dataKey] && homeSettings[dataKey].trim() !== '') {
      return homeSettings[dataKey];
    }
    if (homeSettings?.[key] && homeSettings[key].trim() !== '') {
      return homeSettings[key];
    }
    if (fallbackTKey) return t(fallbackTKey);
    return defaultStatic || '';
  }

  const orderArray = (homeSettings?.sectionOrder || 'hero,why,destinations,testimonial,accordion,socialproof,faq').split(',')

  const renderSection = (key: string) => {
    switch (key.trim()) {
      case 'hero': 
        return <HeroSection key="hero" gs={gs} t={t} waLink={waLink} />
      case 'why': 
        return <WhySection key="why" gs={gs} t={t} locale={locale} homeSettings={homeSettings} />
      case 'destinations': 
        return <DestinationsSection key="destinations" gs={gs} t={t} packages={packages} />
      case 'testimonial': 
        return <TestimonialSection key="testimonial" gs={gs} t={t} waLink={waLink} />
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
