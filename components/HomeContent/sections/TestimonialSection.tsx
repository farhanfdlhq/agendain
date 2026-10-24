'use client'
import { fontStyle } from '@/lib/font-style'
import Image from 'next/image'
import Link from 'next/link'
import FadeIn from '@/components/Motion/FadeIn'
import styles from '../HomeContent.module.css'
import { WhatsAppIcon, renderHighlightedTitle, GALLERY_IMAGES } from '../shared'
import { localizeRepeater, HOME_REPEATERS } from '@/lib/i18n/localize'

export default function TestimonialSection({ gs, t, waLink, locale, homeSettings }: { gs: any, t: any, waLink: string, locale: string, homeSettings: Record<string, unknown> | null }) {
  // Poin di bawah judul dari CMS (repeater); belum pernah diisi → 3 poin bawaan.
  // Semua poin dihapus di CMS → daftar disembunyikan.
  const cmsHighlights = localizeRepeater(homeSettings, 'testiHighlights', locale, HOME_REPEATERS.testiHighlights)
  const highlights: string[] = cmsHighlights
    ? cmsHighlights.map((h) => String(h?.text ?? '').trim()).filter(Boolean)
    : [t('home.testi.highlight1'), t('home.testi.highlight2'), t('home.testi.highlight3')]

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
            {highlights.length > 0 && (
              <ul className={styles.testimonialHighlights}>
                {highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            )}
          </div>
        </FadeIn>
        <FadeIn direction="up" delay={0.2}>
          <div className={styles.galleryMasonry}>
            <div className={styles.galleryCol}>
              <div className={styles.galleryItemSmall}><Image src={gs('galleryImg1', undefined, GALLERY_IMAGES.leftTop)} alt="Gallery 1" fill  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/></div>
              <div className={styles.galleryItemSmall}><Image src={gs('galleryImg2', undefined, GALLERY_IMAGES.leftBottom)} alt="Gallery 2" fill  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/></div>
            </div>
            <div className={styles.galleryCol}>
              <div className={styles.galleryItemTall}>
                <Image src={gs('galleryImg3', undefined, GALLERY_IMAGES.center)} alt="Gallery 3" fill  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/>
                <Link href="/open-trip" className={styles.galleryOverlayBtn}>{gs('testiBtnGallery', 'home.testi.btnGallery')}</Link>
              </div>
            </div>
            <div className={styles.galleryCol}>
              <div className={styles.galleryItemSmall}><Image src={gs('galleryImg4', undefined, GALLERY_IMAGES.rightTop)} alt="Gallery 4" fill  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/></div>
              <div className={styles.galleryItemSmall}><Image src={gs('galleryImg5', undefined, GALLERY_IMAGES.rightBottom)} alt="Gallery 5" fill  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/></div>
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
