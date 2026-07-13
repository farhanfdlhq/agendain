'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import FadeIn from '@/components/Motion/FadeIn'
import Stagger from '@/components/Motion/Stagger'
import { ChevronLeft, ChevronRight, Star, ArrowRight } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import styles from './HomeContent.module.css'

/* ──── WhatsApp SVG Icon ──── */
function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

/* ──── Data ──── */
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

const DESTINATIONS = [
  { name: 'France', price: '18 Juta', rating: '5/5', image: '/dest-france.webp', slug: 'prancis' },
  { name: 'Swiss', price: '24 Juta', rating: '5/5', image: '/dest-swiss.webp', slug: 'swiss' },
  { name: 'Italy', price: '20 Juta', rating: '5/5', image: '/dest-italy.webp', slug: 'italia' },
]

const GALLERY_IMAGES = {
  leftTop: '/gallery-amalfi.webp',
  leftBottom: '/dest-swiss.webp',
  center: '/gallery-colosseum.webp',
  rightTop: '/dest-france.webp',
  rightBottom: '/dest-italy.webp',
}

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

const getTestimonials = (t: any) => [
  {
    name: t('home.testi.name1'),
    text: t('home.testi.text1'),
  },
  {
    name: t('home.testi.name2'),
    text: t('home.testi.text2'),
  },
  {
    name: t('home.testi.name3'),
    text: t('home.testi.text3'),
  },
]

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

/* ──── Component ──── */
export default function HomeContent({
  packages,
  destinations,
  homeSettings,
}: {
  packages: any[]
  destinations: any[]
  homeSettings: any
}) {
  const [activeAccordion, setActiveAccordion] = useState(0)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [isSliderHovered, setIsSliderHovered] = useState(false)

  const { t } = useTranslation()
  const testimonials = getTestimonials(t)

  // Auto-play for the testimonial slider
  useEffect(() => {
    if (isSliderHovered) return
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
    }, 4000)
    return () => clearInterval(interval)
  }, [isSliderHovered, testimonials.length])

  const waNumber = '6281234567890'
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent('Halo, saya ingin bertanya mengenai paket wisata.')}`

  return (
    <>
      {/* ═══════ 1. HERO ═══════ */}
      <section className={styles.hero}>
        <div className={styles.heroImageWrapper}>
          <Image
            src="/hero-coastal.webp"
            alt="Pemandangan pantai Eropa yang indah"
            fill
            priority
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroContent}>
          <FadeIn delay={0.2} direction="up">
            <h1 className={styles.heroTitle}>
              {t('home.hero.title').split(',').map((part: string, idx: number, arr: any[]) => (
                <span key={idx} className={idx === arr.length - 1 ? styles.heroTitleGold : styles.heroTitleWhite}>
                  {part}{idx !== arr.length - 1 ? ',' : ''}
                </span>
              ))}
            </h1>
          </FadeIn>

          <FadeIn delay={0.4} direction="up">
            <p className={styles.heroSubtitle}>
              {t('home.hero.desc')}
            </p>
          </FadeIn>

          <FadeIn delay={0.6} direction="up">
            <div className={styles.heroButtons}>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnWhatsapp}
              >
                <WhatsAppIcon size={20} />
                {t('home.hero.btnWa')}
              </a>
              <Link href="/paket" className={styles.btnGold}>
                {t('home.hero.btnPack')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ 2. WHY CHOOSE US ═══════ */}
      <section className={styles.whySection}>
        <div className={styles.container}>
          <FadeIn direction="up">
            <div className={styles.whySectionHeader}>
              <h2 className={styles.whyTitleMain}>{t('home.faq.title')}</h2>
              <h3 className={styles.whyTitleSub}>
                {t('home.whyTitle')}
              </h3>
            </div>
          </FadeIn>

          {getWhyCards(t).map((card, i) => {
            const isReversed = i % 2 !== 0
            return (
              <FadeIn key={i} direction="up" delay={i * 0.1}>
                <div className={isReversed ? styles.whyCardReverse : styles.whyCard}>
                  <div className={styles.whyCardImage}>
                    <img src={card.image} alt={card.title} loading="lazy" />
                    <div className={isReversed ? styles.whyCardNumberRight : styles.whyCardNumberLeft}>
                      {card.number}
                    </div>
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

      {/* ═══════ 3. FAVORITE DESTINATIONS ═══════ */}
      <section className={styles.destSection}>
        <div className={styles.container}>
          <FadeIn direction="up">
            <div className={styles.destHeader}>
              <div className={styles.destHeaderLeft}>
                <p className={styles.destEyebrow}>{t('home.exploreDest')}</p>
                <h2 className={styles.destTitle}>{t('home.popularDest')}</h2>
              </div>
              <Link href="/destinasi" className={styles.destViewAll}>
                {t('home.viewAll')}
              </Link>
            </div>
          </FadeIn>

          <Stagger className={styles.destGrid}>
            {DESTINATIONS.map((dest) => (
              <Link key={dest.slug} href={`/destinasi/${dest.slug}`} className={styles.destCard}>
                <div className={styles.destCardImageWrapper}>
                  <img src={dest.image} alt={`Destinasi ${dest.name}`} loading="lazy" />
                </div>
                <div className={styles.destCardBody}>
                  <div className={styles.destCardTop}>
                    <h3 className={styles.destCardName}>{dest.name}</h3>
                    <span className={styles.destCardRating}>
                      <Star size={12} fill="#f59e0b" className={styles.destCardRatingStar} />
                      <span className={styles.destCardRatingText}>{dest.rating}</span>
                    </span>
                  </div>
                  <div className={styles.destCardBottom}>
                    <div className={styles.destCardPriceWrapper}>
                      <div className={styles.destCardPriceLabel}>
                        {t('home.dest.startFrom').split(' ').map((word: string, i: number) => (
                          <span key={i}>{word}</span>
                        ))}
                      </div>
                      <span className={styles.destCardPriceValue}>{dest.price}</span>
                    </div>
                    <span className={styles.destCardBooking}>Booking</span>
                  </div>
                </div>
              </Link>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ═══════ 4. SUDUT PANDANG / TESTIMONIAL GALLERY ═══════ */}
      <section className={styles.testimonialSection}>
        <div className={styles.container}>
          <FadeIn direction="up">
            <div className={styles.testimonialHeader}>
              <span className={styles.testimonialBadge}>{t('home.testi.badge')}</span>
              <h2 className={styles.testimonialTitle}>
                &ldquo;{t('home.testi.quoteTitle1')}
                <span className={styles.testimonialTitleHighlight}>Italia</span>
                {t('home.testi.quoteTitle2')}&rdquo;
              </h2>
              <ul className={styles.testimonialHighlights}>
                <li>{t('home.testi.highlight1')}</li>
                <li>{t('home.testi.highlight2')}</li>
                <li>{t('home.testi.highlight3')}</li>
              </ul>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <div className={styles.galleryMasonry}>
              {/* Left Column */}
              <div className={styles.galleryCol}>
                <div className={styles.galleryItemSmall}>
                  <img src={GALLERY_IMAGES.leftTop} alt="Amalfi Coast" loading="lazy" />
                </div>
                <div className={styles.galleryItemSmall}>
                  <img src={GALLERY_IMAGES.leftBottom} alt="Swiss Alps" loading="lazy" />
                </div>
              </div>

              {/* Center Column */}
              <div className={styles.galleryCol}>
                <div className={styles.galleryItemTall}>
                  <img src={GALLERY_IMAGES.center} alt="Colosseum Roma" loading="lazy" />
                  <Link href="/paket" className={styles.galleryOverlayBtn}>
                    Eksplor Trip →
                  </Link>
                </div>
              </div>

              {/* Right Column */}
              <div className={styles.galleryCol}>
                <div className={styles.galleryItemSmall}>
                  <img src={GALLERY_IMAGES.rightTop} alt="Paris" loading="lazy" />
                </div>
                <div className={styles.galleryItemSmall}>
                  <img src={GALLERY_IMAGES.rightBottom} alt="Italia" loading="lazy" />
                </div>
              </div>
            </div>
          </FadeIn>

          <div className={styles.testimonialCta}>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.btnWhatsapp}>
              <WhatsAppIcon size={18} />
              {t('home.testi.btnWa')}
            </a>
          </div>
        </div>
      </section>

      {/* ═══════ 5. ACCORDION / LIHAT HIRUP SIMPAN ═══════ */}
      <section className={styles.accordionSection}>
        <div className={styles.container}>
          <div className={styles.accordionLayout}>
            <div className={styles.accordionLeft}>
              <FadeIn direction="up">
                <h2 className={styles.accordionSectionTitle}>
                  {t('home.acc.title')}
                </h2>
                <p className={styles.accordionSubtitle}>{t('home.acc.subtitle')}</p>
              </FadeIn>

              {getAccordionItems(t).map((item, i) => (
                <FadeIn key={i} direction="up" delay={i * 0.05}>
                  <div className={activeAccordion === i ? styles.accordionItemActive : styles.accordionItem}>
                    <button
                      className={styles.accordionTrigger}
                      onClick={() => setActiveAccordion(activeAccordion === i ? -1 : i)}
                      aria-expanded={activeAccordion === i}
                    >
                      <span>{item.title}</span>
                      <span className={activeAccordion === i ? styles.accordionIconOpen : styles.accordionIcon}>+</span>
                    </button>
                    <AnimatePresence initial={false}>
                      {activeAccordion === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div className={styles.accordionBody}>
                            {item.body}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </FadeIn>
              ))}

              <FadeIn direction="up" delay={0.3}>
                <Link href="/paket" className={styles.accordionBottomBtn}>
                  {t('home.acc.btnMore')} <ArrowRight size={16} />
                </Link>
              </FadeIn>
            </div>

            <FadeIn direction="right" delay={0.2}>
              <div className={styles.accordionRight}>
                <img src="/accordion-street.webp" alt="Jalanan Eropa yang menawan" loading="lazy" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ 6. SOCIAL PROOF / CELEBRITY ═══════ */}
      <section className={styles.socialProofSection}>
        <div className={styles.socialProofBg}>
          <img src="/dest-italy.webp" alt="" aria-hidden="true" />
        </div>
        <div className={`${styles.container} ${styles.socialProofContent}`}>
          <FadeIn direction="left">
            <div className={styles.socialProofLeft}>
              <div className={styles.socialProofImageWrapper}>
                <img src="/el-rumi-syifa.webp" alt="El Rumi & Syifa" loading="lazy" />
                <div className={styles.socialProofQuestionMark}>?</div>
              </div>
              <div className={styles.socialProofQuoteCard}>
                <p className={styles.socialProofQuoteName}>El Rumi & Syifa</p>
                <p className={styles.socialProofQuoteText}>
                  Biasanya kalau ngerencanain trip tuh paling pusing nyamain jadwal dan ngurusin printilannya. Pas nyoba pakai Agendain, beneran tinggal bawa koper doang. Itinerary-nya asik, transportasinya nyaman, dan spot-spot di Italia kemarin juara semua. Gak cuma berakhir jadi wacana di grup chat!
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="right" delay={0.2} className={styles.socialProofRightWrapper}>
            <div className={styles.socialProofRight}>
              <h2 className={styles.socialProofRightTitle}>
                {t('home.social.title1')}<span className={styles.textYellow}>{t('home.social.title2')}</span>{t('home.social.title3')}<br className={styles.hideMobile} />
                <span className={styles.textYellow}>{t('home.social.title4')}</span>
              </h2>
              <p className={styles.socialProofRightSubtitle}>
                {t('home.social.subtitle')}
              </p>

              <div 
                className={styles.testimonialSliderContainer}
                onMouseEnter={() => setIsSliderHovered(true)}
                onMouseLeave={() => setIsSliderHovered(false)}
              >
                <div className={styles.testimonialSlider}>
                  <div className={styles.testimonialSlides}>
                    <AnimatePresence initial={false}>
                      {testimonials.map((tItem, idx) => {
                        const prevIdx = activeTestimonial === 0 ? testimonials.length - 1 : activeTestimonial - 1
                        const nextIdx = activeTestimonial === testimonials.length - 1 ? 0 : activeTestimonial + 1
                        
                        let positionClass = styles.testimonialSlideHidden
                        if (idx === activeTestimonial) positionClass = styles.testimonialSlideActive
                        else if (idx === prevIdx) positionClass = styles.testimonialSlideInactivePrev
                        else if (idx === nextIdx) positionClass = styles.testimonialSlideInactiveNext

                        if (positionClass === styles.testimonialSlideHidden) return null

                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, zIndex: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`${styles.testimonialSlideBase} ${positionClass}`}
                          >
                            <p className={styles.testimonialSlideName}>{tItem.name}</p>
                            <p className={styles.testimonialSlideText}>{tItem.text}</p>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>

                <button
                  className={styles.sliderBtnLeft}
                  onClick={() => setActiveTestimonial(prev => prev === 0 ? testimonials.length - 1 : prev - 1)}
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft size={24} color="#ffffff" />
                </button>
                <button
                  className={styles.sliderBtnRight}
                  onClick={() => setActiveTestimonial(prev => prev === testimonials.length - 1 ? 0 : prev + 1)}
                  aria-label="Next testimonial"
                >
                  <ChevronRight size={24} color="#ffffff" />
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ 7. FAQ ═══════ */}
      <section className={styles.faqSection}>
        <div className={styles.container}>
          <FadeIn direction="up">
            <div className={styles.faqHeader}>
              <span className={styles.faqBadge}>
                <span className={styles.faqBadgeQ}>?</span> {t('home.faq.subtitle')}
              </span>
              <h2 className={styles.faqTitle}>{t('home.faq.title')}</h2>
              <p className={styles.faqSubtitle}>
                {t('home.faq.moreSub')}
              </p>
            </div>
          </FadeIn>

          <div className={styles.faqList}>
            {getFaqItems(t).map((item, i) => (
              <FadeIn key={i} direction="up" delay={i * 0.05}>
                <div className={styles.faqItem}>
                  <button
                    className={styles.faqTrigger}
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    aria-expanded={activeFaq === i}
                  >
                    <span>{item.q}</span>
                    <span className={activeFaq === i ? styles.faqIconOpen : styles.faqIcon}>+</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {activeFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                      >
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
              <p className={styles.faqCtaText}>
                {t('home.faq.more')} {t('home.faq.moreSub')}
              </p>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.btnWhatsapp}>
                <WhatsAppIcon size={18} />
                {t('home.faq.btnWa')}
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
