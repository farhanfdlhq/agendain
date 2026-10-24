'use client'
import { fontStyle } from '@/lib/font-style'
import Image from 'next/image'
import Link from 'next/link'
import FadeIn from '@/components/Motion/FadeIn'
import styles from '../HomeContent.module.css'
import { WhatsAppIcon, renderHighlightedTitle, GALLERY_IMAGES } from '../shared'
import { localizeRepeater, HOME_REPEATERS } from '@/lib/i18n/localize'

export default function TestimonialSection({ gs, t, waLink, locale, homeSettings }: { gs: any, t: any, waLink: string, locale: string, homeSettings: Record<string, unknown> | null }) {
  // Poin di bawah judul dari CMS (satu poin per baris / Enter); mendukung juga bentuk array warisan.
  const rawHighlights = locale === 'en'
    ? (homeSettings?.testiHighlights_en || homeSettings?.testiHighlights)
    : homeSettings?.testiHighlights

  let highlights: string[] = []
  if (typeof rawHighlights === 'string' && rawHighlights.trim()) {
    highlights = rawHighlights.split('\n').map((s) => s.trim()).filter(Boolean)
  } else if (Array.isArray(rawHighlights)) {
    highlights = rawHighlights.map((h) => String((h && typeof h === 'object' && 'text' in h) ? (h as any).text : h ?? '').trim()).filter(Boolean)
  } else {
    const cmsHighlights = localizeRepeater(homeSettings, 'testiHighlights', locale, HOME_REPEATERS.testiHighlights)
    highlights = cmsHighlights
      ? cmsHighlights.map((h) => String(h?.text ?? '').trim()).filter(Boolean)
      : [t('home.testi.highlight1'), t('home.testi.highlight2'), t('home.testi.highlight3')]
  }

  // Mendukung emoji manual jika diketik admin di awal baris (mis. 🍕, 📸, 🏛️).
  // Jika baris tidak memiliki emoji, tampilkan titik emas brand (antislop-ui).
  const emojiRegex = /^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*|[\u2600-\u27BF](?:\uFE0F)?)\s*/u
  const parsedHighlights = highlights.map((line) => {
    const match = line.match(emojiRegex)
    if (match) {
      return { icon: match[1], text: line.slice(match[0].length) }
    }
    return { icon: null, text: line }
  })

  return (
    <section key="testimonial" className={styles.testimonialSection}>
      <div className={styles.container}>
        <FadeIn direction="up">
          <div className={styles.testimonialHeader}>
            <span className={styles.testimonialBadge} style={fontStyle(gs, 'testiBadge')}>{gs('testiBadge', 'home.testi.badge')}</span>
            <h2 className={styles.testimonialTitle} style={fontStyle(gs, 'testiTitle')}>
              {gs('testiTitle') ? (
                renderHighlightedTitle(gs('testiTitle'), '', styles.testimonialTitleHighlight)
              ) : (
                <>
                  &ldquo;{t('home.testi.quoteTitle1')} <span className={styles.testimonialTitleHighlight}>{t('home.testi.quoteCountry')}</span> {t('home.testi.quoteTitle2')}&rdquo;
                </>
              )}
            </h2>
            {parsedHighlights.length > 0 && (
              <ul className={styles.testimonialHighlights}>
                {parsedHighlights.map((item, i) => (
                  <li key={i} style={fontStyle(gs, 'testiHighlights')}>
                    {item.icon ? (
                      <span className={styles.testimonialHighlightIcon}>{item.icon}</span>
                    ) : (
                      <span className={styles.testimonialHighlightDot} aria-hidden="true" />
                    )}
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </FadeIn>
        <FadeIn direction="up" delay={0.2}>
          <div className={styles.galleryMasonry}>
            <div className={styles.galleryCol}>
              <div className={styles.galleryItemSmall}><Image src={gs('galleryImg1', undefined, GALLERY_IMAGES.leftTop)} alt="Momen liburan seru peserta open trip Agendain di destinasi Eropa" fill  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/></div>
              <div className={styles.galleryItemSmall}><Image src={gs('galleryImg2', undefined, GALLERY_IMAGES.leftBottom)} alt="Pengalaman berfoto di spot ikonik kota-kota Eropa bersama Agendain" fill  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/></div>
            </div>
            <div className={styles.galleryCol}>
              <div className={styles.galleryItemTall}>
                <Image src={gs('galleryImg3', undefined, GALLERY_IMAGES.center)} alt="Dokumentasi perjalanan wisata Eropa bersama kawan traveler Agendain" fill  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/>
                <Link href="/open-trip" className={styles.galleryOverlayBtn}>{gs('testiBtnGallery', 'home.testi.btnGallery')}</Link>
              </div>
            </div>
            <div className={styles.galleryCol}>
              <div className={styles.galleryItemSmall}><Image src={gs('galleryImg4', undefined, GALLERY_IMAGES.rightTop)} alt="Pemandangan indah pegunungan dan panorama Eropa dalam trip Agendain" fill  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/></div>
              <div className={styles.galleryItemSmall}><Image src={gs('galleryImg5', undefined, GALLERY_IMAGES.rightBottom)} alt="Kenangan tak terlupakan kawan Agendain saat menjelajahi benua Eropa" fill  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/></div>
            </div>
          </div>
        </FadeIn>
        <div className={styles.testimonialCta}>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.btnWhatsapp}>
            <WhatsAppIcon size={18} /> {gs('testiBtnWa', 'home.testi.btnWa')}
          </a>
        </div>
      </div>
    </section>
  )
}
