'use client'
import Image from 'next/image'
import FadeIn from '@/components/Motion/FadeIn'
import styles from '../HomeContent.module.css'
import { renderHighlightedTitle } from '../shared'
import { localizeRepeater, HOME_REPEATERS } from '@/lib/i18n/localize'

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
  // Satu array untuk kedua bahasa: gambar & bobot huruf ikut dari baris yang
  // sama, hanya teksnya yang dilokalkan. Dulu array EN diambil bulat-bulat
  // sehingga gambar versi Inggris membeku pada nilai lama.
  const whyItems = localizeRepeater(homeSettings, 'whyItems', locale, HOME_REPEATERS.whyItems) ?? getWhyCards(t);

  return (
    <section key="why" className={styles.whySection}>
      <div className={styles.container}>
        <FadeIn direction="up">
          <div className={styles.whySectionHeader}>
            <span className={styles.whyTitleMain} style={gs('whyTitleMainWeight') ? { fontWeight: Number(gs('whyTitleMainWeight')) } : undefined}>{gs('whyTitleMain', 'home.why.eyebrow')}</span>
            <h2 className={styles.whyTitleSub} style={gs('whyTitleSubWeight') ? { fontWeight: Number(gs('whyTitleSubWeight')) } : undefined}>{renderHighlightedTitle(gs('whyTitleSub', 'home.whyTitle'))}</h2>
          </div>
        </FadeIn>
        {/* Bento asimetris: 1 tile besar (alasan utama) + 1 lebar + 2 kecil, tiap
            tile foto ber-scrim gelap dengan teks putih & badge angka (kuning
            fill). Ritme ukuran yang beragam menghindari kesan "kartu seragam". */}
        <div className={styles.whyBento}>
          {whyItems.map((card: any, i: number) => {
            const tileClass = i === 0 ? styles.whyTileLarge : i === 1 ? styles.whyTileWide : styles.whyTileSmall
            const showDesc = i < 2
            return (
              <FadeIn key={i} direction="up" delay={i * 0.08} className={`${styles.whyTile} ${tileClass}`}>
                <Image
                  src={card.image || card.foto || '/placeholder.webp'}
                  alt={card.title}
                  fill
                  className={styles.whyTileImg}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                />
                <div className={styles.whyTileScrim} aria-hidden="true" />
                <div className={styles.whyTileContent}>
                  <span className={styles.whyTileBadge}>{String(i + 1).padStart(2, '0')}</span>
                  <h3 className={styles.whyTileTitle} style={card.titleWeight ? { fontWeight: Number(card.titleWeight) } : undefined}>{card.title}</h3>
                  {showDesc && (
                    <p className={styles.whyTileDesc} style={card.descWeight ? { fontWeight: Number(card.descWeight) } : undefined}>{card.desc}</p>
                  )}
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
