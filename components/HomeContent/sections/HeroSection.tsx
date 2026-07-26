'use client'
import Image from 'next/image'
import Link from 'next/link'
import FadeIn from '@/components/Motion/FadeIn'
import styles from '../HomeContent.module.css'
import { WhatsAppIcon, renderHighlightedTitle } from '../shared'

export default function HeroSection({ gs, t, waLink }: { gs: any, t: any, waLink: string }) {
  return (
    <section key="hero" className={styles.hero}>
      <div className={styles.heroImageWrapper}>
        <Image src={gs('heroBgImage', undefined, '/hero-coastal.webp')} alt="Hero" fill priority className={styles.heroImage}  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/>
        <div className={styles.heroOverlay} />
      </div>
      <div className={styles.heroContent}>
        <FadeIn delay={0.2} direction="up">
          <h1 className={styles.heroTitle}>
            {renderHighlightedTitle(gs('heroTitle', 'home.hero.title'), styles.heroTitleWhite, styles.heroTitleGold)}
          </h1>
        </FadeIn>
        <FadeIn delay={0.4} direction="up">
          <p className={styles.heroSubtitle} style={gs('heroSubtitleWeight') ? { fontWeight: Number(gs('heroSubtitleWeight')) } : undefined}>{gs('heroSubtitle', 'home.hero.desc')}</p>
        </FadeIn>
        <FadeIn delay={0.6} direction="up">
          <div className={styles.heroButtons}>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.btnWhatsapp}>
              <WhatsAppIcon size={20} /> {t('home.hero.btnWa')}
            </a>
            <Link href="/open-trip" className={styles.btnGold}>{t('home.hero.btnPack')}</Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
