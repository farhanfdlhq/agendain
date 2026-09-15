'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import styles from '../HomeContent.module.css'
import { WhatsAppIcon } from '../shared'

// Kurva "easeOutExpo" — meluncur cepat lalu mengendap halus, kesan sinematik.
const EASE = [0.22, 1, 0.36, 1] as const

/** Pecah judul jadi bagian putih & bagian emas (sintaks `*emas*`, atau koma
 *  seperti renderHighlightedTitle), tiap bagian jadi elemen yang dianimasikan. */
function pecahJudul(text: string): { text: string; gold: boolean }[] {
  if (!text) return []
  if (text.includes('*')) {
    return text
      .split(/(\*[^*]+\*)/g)
      .filter(Boolean)
      .map((p) =>
        p.startsWith('*') && p.endsWith('*')
          ? { text: p.slice(1, -1), gold: true }
          : { text: p, gold: false },
      )
  }
  const segs = text.split(',')
  return segs.map((seg, i) => ({
    text: seg + (i < segs.length - 1 ? ', ' : ''),
    gold: i === segs.length - 1 && segs.length > 1,
  }))
}

type Gs = (key: string, fallbackTKey?: string, defaultStatic?: string) => string
type Tr = (key: string) => string

export default function HeroSection({ gs, t, waLink }: { gs: Gs; t: Tr; waLink: string }) {
  const reduce = useReducedMotion()
  const parts = pecahJudul(gs('heroTitle', 'home.hero.title'))

  // Kaskade halus antar-elemen hero.
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: 0.15 } },
  }
  // Hanya menganimasikan opacity + transform (y/scale) — keduanya di-composite
  // GPU. `filter: blur()` sengaja DIHAPUS: ia tidak bisa di-composite sehingga
  // Lighthouse menandainya "animasi tidak digabungkan" dan memperlambat LCP/SI
  // di HP. Kesan sinematiknya tetap terjaga lewat rise + pop.
  const rise: Variants = reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5 } } }
    : {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
      }
  // Kata emas: sama seperti rise tapi dengan spring "pop".
  const pop: Variants = reduce
    ? rise
    : {
        hidden: { opacity: 0, y: 24, scale: 0.9 },
        visible: {
          opacity: 1, y: 0, scale: 1,
          transition: { type: 'spring', stiffness: 200, damping: 15, mass: 0.7 },
        },
      }
  const accent: Variants = reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { scaleX: 0, opacity: 0 },
        visible: { scaleX: 1, opacity: 1, transition: { duration: 0.7, ease: EASE } },
      }

  return (
    <section key="hero" className={styles.hero}>
      <div className={styles.heroImageWrapper}>
        <Image
          src={gs('heroBgImage', undefined, '/hero-coastal.webp')}
          alt="Hero"
          fill
          priority
          className={styles.heroImage}
          quality={85}
          sizes="100vw"
        />
        <div className={styles.heroOverlay} />
      </div>

      <motion.div className={styles.heroContent} variants={container} initial="hidden" animate="visible">
        <motion.h1
          className={styles.heroTitle}
          variants={container}
          style={gs('heroTitleWeight') ? { fontWeight: Number(gs('heroTitleWeight')) } : undefined}
        >
          {parts.map((p, i) => (
            <motion.span
              key={i}
              variants={p.gold ? pop : rise}
              className={p.gold ? styles.heroTitleGold : styles.heroTitleWhite}
              // `pre-wrap`: pertahankan spasi di tepi tiap potongan (mis. " Aja!")
              // yang kalau tidak akan ditelan oleh `inline-block` sehingga kata
              // emas & kata sesudahnya menempel ("AgendainAja!"). Tetap boleh wrap.
              style={{ display: 'inline-block', whiteSpace: 'pre-wrap', willChange: 'transform, opacity' }}
            >
              {p.text === ' ' ? ' ' : p.text}
            </motion.span>
          ))}
        </motion.h1>

        <motion.div className={styles.heroAccent} variants={accent} aria-hidden="true" />

        <motion.p
          className={styles.heroSubtitle}
          variants={rise}
          style={gs('heroSubtitleWeight') ? { fontWeight: Number(gs('heroSubtitleWeight')) } : undefined}
        >
          {gs('heroSubtitle', 'home.hero.desc')}
        </motion.p>

        <motion.div className={styles.heroButtons} variants={rise}>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.btnWhatsapp}>
            <WhatsAppIcon size={20} /> {t('home.hero.btnWa')}
          </a>
          <Link href="/open-trip" className={styles.btnGold}>{t('home.hero.btnPack')}</Link>
        </motion.div>
      </motion.div>

      {/* Scroll cue — muncul terakhir, memantul lembut (diam bila reduced-motion). */}
      <motion.div
        className={styles.heroScrollCue}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0.3 : 1.1, duration: 0.6 }}
      >
        <motion.span
          animate={reduce ? undefined : { y: [0, 8, 0] }}
          transition={reduce ? undefined : { repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          <ChevronDown size={30} />
        </motion.span>
      </motion.div>
    </section>
  )
}
