'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowDown } from 'lucide-react'
import FadeIn from '@/components/Motion/FadeIn'
import styles from '../HomeContent.module.css'
import { renderHighlightedTitle } from '../shared'

const getAccordionItems = (t: any) => [
  {
    title: t('home.acc1.title'),
    body: t('home.acc1.desc'),
  },
  {
    title: t('home.acc2.title'),
    body: t('home.acc2.desc'),
  },
  {
    title: t('home.acc3.title'),
    body: t('home.acc3.desc'),
  },
  {
    title: t('home.acc4.title'),
    body: t('home.acc4.desc'),
  },
]

export default function AccordionSection({ gs, t, locale, homeSettings }: { gs: any, t: any, locale: string, homeSettings: any }) {
  const [activeAccordion, setActiveAccordion] = useState(0)
  const rawAcc = homeSettings?.[locale === 'en' ? 'accItems_en' : 'accItems'] || homeSettings?.accItems;
  const accItems = Array.isArray(rawAcc) ? rawAcc : getAccordionItems(t);

  return (
    <section key="accordion" className={styles.accordionSection}>
      <div className={styles.container}>
        <FadeIn direction="up">
          <div className={styles.accordionHeaderCenter}>
            <div className={styles.accordionEyebrowPill}>Sudut Pandang</div>
            <h2 className={styles.accordionTitleCenter}>{gs('accTitle', undefined, 'Lihat, Hirup, & Simpan Memori')}</h2>
            <h3 className={styles.accordionSubtitleCenter} style={gs('accSubtitleWeight') ? { fontWeight: Number(gs('accSubtitleWeight')) } : undefined}>{gs('accSubtitle', undefined, 'Sudut Terbaik Eropa')}</h3>
          </div>
        </FadeIn>
        <div className={styles.accordionLayout}>
          <div className={styles.accordionLeft}>
            {accItems.map((item: any, i: number) => (
              <FadeIn key={i} direction="up" delay={i * 0.05}>
                <div className={activeAccordion === i ? styles.accordionItemActive : styles.accordionItem}>
                  <button className={styles.accordionTrigger} onClick={() => setActiveAccordion(activeAccordion === i ? -1 : i)} aria-expanded={activeAccordion === i}>
                    <span>{item.title}</span>
                    <span className={activeAccordion === i ? styles.accordionIconOpen : styles.accordionIcon}><ArrowDown size={16} /></span>
                  </button>
                  <AnimatePresence initial={false}>
                    {activeAccordion === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} style={{ overflow: 'hidden' }}>
                        <div className={styles.accordionBody}>{item.body}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            ))}
            <FadeIn direction="up" delay={0.3}>
              <div className={styles.accordionBtnWrapper}>
                <Link href="/open-trip" className={styles.accordionBottomBtn}>{t('home.acc.btnMore') || 'Pertanyaan Lain'} &rarr;</Link>
              </div>
            </FadeIn>
          </div>
          <FadeIn direction="right" delay={0.2}>
            <div className={styles.accordionRight}><Image src={gs('accImage', undefined, '/accordion-street.webp')} alt="Accordion" fill  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/></div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
