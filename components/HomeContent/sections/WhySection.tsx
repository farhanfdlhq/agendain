'use client'
import Image from 'next/image'
import FadeIn from '@/components/Motion/FadeIn'
import styles from '../HomeContent.module.css'
import { renderHighlightedTitle } from '../shared'

const getWhyCards = (t: any) => [
  {
    number: '#1',
    title: t('home.why1.title'),
    desc: t('home.why1.desc'),
    image: '/why-hotel.webp',
  },
  {
    number: '#2',
    title: t('home.why2.title'),
    desc: t('home.why2.desc'),
    image: '/placeholder.webp',
  },
  {
    number: '#3',
    title: t('home.why3.title'),
    desc: t('home.why3.desc'),
    image: '/why-support.webp',
  },
  {
    number: '#4',
    title: t('home.why4.title'),
    desc: t('home.why4.desc'),
    image: '/why-camera.webp',
  },
]

export default function WhySection({ gs, t, locale, homeSettings }: { gs: any, t: any, locale: string, homeSettings: any }) {
  const rawWhy = homeSettings?.[locale === 'en' ? 'whyItems_en' : 'whyItems'] || homeSettings?.whyItems;
  const whyItems = Array.isArray(rawWhy) ? rawWhy : getWhyCards(t);

  return (
    <section key="why" className={styles.whySection}>
      <div className={styles.container}>
        <FadeIn direction="up">
          <div className={styles.whySectionHeader}>
            <h2 className={styles.whyTitleMain}>{gs('whyTitleMain', 'home.faq.title')}</h2>
            <h3 className={styles.whyTitleSub}>{renderHighlightedTitle(gs('whyTitleSub', 'home.whyTitle'))}</h3>
          </div>
        </FadeIn>
        {whyItems.map((card: any, i: number) => {
          const isReversed = i % 2 !== 0
          return (
            <FadeIn key={i} direction="up" delay={i * 0.1}>
              <div className={isReversed ? styles.whyCardReverse : styles.whyCard}>
                <div className={styles.whyCardImage}>
                  <Image src={card.image || card.foto || '/placeholder.webp'} alt={card.title} fill className={styles.whyCardImageItem}  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/>
                  <div className={isReversed ? styles.whyCardNumberRight : styles.whyCardNumberLeft}>{card.number}</div>
                </div>
                <div className={styles.whyCardText}>
                  <h3 className={styles.whyCardTitle}>{card.title}</h3>
                  <p className={styles.whyCardDesc}>{card.desc}</p>
                </div>
              </div>
            </FadeIn>
          )
        })}
      </div>
    </section>
  )
}
