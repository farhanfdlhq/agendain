'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import FadeIn from '@/components/Motion/FadeIn'
import styles from '../HomeContent.module.css'
import { renderHighlightedTitle } from '../shared'

export default function SocialProofSection({ gs, t, locale, homeSettings, testimonials }: { gs: any, t: any, locale: string, homeSettings: any, testimonials: any[] }) {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [isSliderHovered, setIsSliderHovered] = useState(false)

  const rawTesti = homeSettings?.[locale === 'en' ? 'testiItems_en' : 'testiItems'] || homeSettings?.testiItems;
  const testiItems = Array.isArray(rawTesti) ? rawTesti : testimonials;

  useEffect(() => {
    if (isSliderHovered) return
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev === testiItems.length - 1 ? 0 : prev + 1))
    }, 4000)
    return () => clearInterval(interval)
  }, [isSliderHovered, testiItems.length])

  return (
    <section key="socialproof" className={styles.socialProofSection}>
      <div className={styles.socialProofBg}><Image src={gs('socialBgImg', undefined, '/dest-italy.webp')} alt="" fill aria-hidden="true"  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/></div>
      <div className={`${styles.container} ${styles.socialProofContent}`}>
        <FadeIn direction="left">
          <div className={styles.socialProofLeft}>
            <div className={styles.socialProofImageWrapper}>
              <AnimatePresence mode="wait">
                <motion.div key={activeTestimonial} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} style={{ position: 'absolute', inset: 0 }}>
                  <Image src={testiItems[activeTestimonial]?.photo || gs('socialImage', undefined, '/el-rumi-syifa.webp')} alt="Social Proof" fill style={{ objectFit: 'cover' }}  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/>
                </motion.div>
              </AnimatePresence>
              <div className={styles.socialProofQuestionMark}>?</div>
            </div>
            <div className={styles.socialProofQuoteCard}>
              <AnimatePresence mode="wait">
                <motion.div key={activeTestimonial} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  <p className={styles.socialProofQuoteName}>{testiItems[activeTestimonial]?.name || gs('socialName', undefined, 'El Rumi & Syifa')}</p>
                  <p className={styles.socialProofQuoteText}>{testiItems[activeTestimonial]?.text || gs('socialQuote', undefined, 'Biasanya kalau ngerencanain trip tuh paling pusing nyamain jadwal dan ngurusin printilannya.')}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </FadeIn>
        <FadeIn direction="right" delay={0.2} className={styles.socialProofRightWrapper}>
          <div className={styles.socialProofRight}>
            <h2 className={styles.socialProofRightTitle}>
              {gs('socialTitle') ? (
                renderHighlightedTitle(gs('socialTitle'), '', styles.textYellow)
              ) : (
                <>
                  {t('home.social.title1')}<span className={styles.textYellow}>{t('home.social.title2')}</span>{t('home.social.title3')}<br className={styles.hideMobile} /><span className={styles.textYellow}>{t('home.social.title4')}</span>
                </>
              )}
            </h2>
            <p className={styles.socialProofRightSubtitle}>{gs('socialSubtitle', 'home.social.subtitle')}</p>
            <div className={styles.testimonialSliderContainer} onMouseEnter={() => setIsSliderHovered(true)} onMouseLeave={() => setIsSliderHovered(false)}>
              <div className={styles.testimonialSlider}>
                <div className={styles.testimonialSlides}>
                  <AnimatePresence initial={false}>
                    {testiItems.map((tItem: any, idx: number) => {
                      const prevIdx = activeTestimonial === 0 ? testiItems.length - 1 : activeTestimonial - 1
                      const nextIdx = activeTestimonial === testiItems.length - 1 ? 0 : activeTestimonial + 1
                      let positionClass = styles.testimonialSlideHidden
                      if (idx === activeTestimonial) positionClass = styles.testimonialSlideActive
                      else if (idx === prevIdx) positionClass = styles.testimonialSlideInactivePrev
                      else if (idx === nextIdx) positionClass = styles.testimonialSlideInactiveNext
                      if (positionClass === styles.testimonialSlideHidden) return null
                      return (
                        <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, zIndex: 0 }} transition={{ duration: 0.3 }} className={`${styles.testimonialSlideBase} ${positionClass}`}>
                          <p className={styles.testimonialSlideName}>{tItem.name}</p>
                          <p className={styles.testimonialSlideText}>{tItem.text}</p>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>
              <button className={styles.sliderBtnLeft} onClick={() => setActiveTestimonial(prev => prev === 0 ? testiItems.length - 1 : prev - 1)}><ChevronLeft size={24} color="#ffffff" /></button>
              <button className={styles.sliderBtnRight} onClick={() => setActiveTestimonial(prev => prev === testiItems.length - 1 ? 0 : prev + 1)}><ChevronRight size={24} color="#ffffff" /></button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
