'use client'
import Image from 'next/image'
import Link from 'next/link'
import FadeIn from '@/components/Motion/FadeIn'
import styles from '../HomeContent.module.css'
import { WhatsAppIcon, renderHighlightedTitle, GALLERY_IMAGES } from '../shared'

export default function TestimonialSection({ gs, t, waLink }: { gs: any, t: any, waLink: string }) {
  return (
    <section key="testimonial" className={styles.testimonialSection}>
      <div className={styles.container}>
        <FadeIn direction="up">
          <div className={styles.testimonialHeader}>
            <span className={styles.testimonialBadge}>{gs('testiBadge', 'home.testi.badge')}</span>
            <h2 className={styles.testimonialTitle}>
              {gs('testiTitle') ? (
                renderHighlightedTitle(gs('testiTitle'), '', styles.testimonialTitleHighlight)
              ) : (
                <>
                  &ldquo;{t('home.testi.quoteTitle1')} <span className={styles.testimonialTitleHighlight}>Italia</span> {t('home.testi.quoteTitle2')}&rdquo;
                </>
              )}
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
            <div className={styles.galleryCol}>
              <div className={styles.galleryItemSmall}><Image src={gs('galleryImg1', undefined, GALLERY_IMAGES.leftTop)} alt="Gallery 1" fill /></div>
              <div className={styles.galleryItemSmall}><Image src={gs('galleryImg2', undefined, GALLERY_IMAGES.leftBottom)} alt="Gallery 2" fill /></div>
            </div>
            <div className={styles.galleryCol}>
              <div className={styles.galleryItemTall}>
                <Image src={gs('galleryImg3', undefined, GALLERY_IMAGES.center)} alt="Gallery 3" fill />
                <Link href="/open-trip" className={styles.galleryOverlayBtn}>Eksplor Trip →</Link>
              </div>
            </div>
            <div className={styles.galleryCol}>
              <div className={styles.galleryItemSmall}><Image src={gs('galleryImg4', undefined, GALLERY_IMAGES.rightTop)} alt="Gallery 4" fill /></div>
              <div className={styles.galleryItemSmall}><Image src={gs('galleryImg5', undefined, GALLERY_IMAGES.rightBottom)} alt="Gallery 5" fill /></div>
            </div>
          </div>
        </FadeIn>
        <div className={styles.testimonialCta}>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.btnWhatsapp}>
            <WhatsAppIcon size={18} /> {t('home.testi.btnWa')}
          </a>
        </div>
      </div>
    </section>
  )
}
