'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import FadeIn from '@/components/Motion/FadeIn'
import styles from '../HomeContent.module.css'
import { WhatsAppIcon, renderHighlightedTitle } from '../shared'

const getFaqItems = (t: any) => [
  {
    q: t('home.faq.q1'),
    a: t('home.faq.a1'),
  },
  {
    q: t('home.faq.q2'),
    a: t('home.faq.a2'),
  },
  {
    q: t('home.faq.q3'),
    a: t('home.faq.a3'),
  },
  {
    q: t('home.faq.q4'),
    a: t('home.faq.a4'),
  },
  {
    q: t('home.faq.q5'),
    a: t('home.faq.a5'),
  },
]

export default function FaqSection({ gs, t, locale, homeSettings, waLink }: { gs: any, t: any, locale: string, homeSettings: any, waLink: string }) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  
  const rawFaq = homeSettings?.[locale === 'en' ? 'faqItems_en' : 'faqItems'] || homeSettings?.faqItems;
  const faqItems = Array.isArray(rawFaq) ? rawFaq : getFaqItems(t);

  return (
    <section key="faq" className={styles.faqSection}>
      <div className={styles.container}>
        <FadeIn direction="up">
          <div className={styles.faqHeader}>
            <span className={styles.faqBadge}><span className={styles.faqBadgeQ}>?</span> {t('home.faq.subtitle')}</span>
            <h2 className={styles.faqTitle}>{renderHighlightedTitle(gs('faqTitle', 'home.faq.title'))}</h2>
            <p className={styles.faqSubtitle}>{gs('faqSubtitle', 'home.faq.moreSub')}</p>
          </div>
        </FadeIn>
        <div className={styles.faqList}>
          {faqItems.map((item: any, i: number) => (
            <FadeIn key={i} direction="up" delay={i * 0.05}>
              <div className={styles.faqItem}>
                <button className={styles.faqTrigger} onClick={() => setActiveFaq(activeFaq === i ? null : i)} aria-expanded={activeFaq === i}>
                  <span>{item.q}</span>
                  <span className={activeFaq === i ? styles.faqIconOpen : styles.faqIcon}>+</span>
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} style={{ overflow: 'hidden' }}>
                      <div className={styles.faqBody}>{item.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn direction="up" delay={0.3}>
          <div className={styles.faqCta}>
            <p className={styles.faqCtaText}>{t('home.faq.more')} {t('home.faq.moreSub')}</p>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.btnWhatsapp}>
              <WhatsAppIcon size={18} /> {t('home.faq.btnWa')}
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
