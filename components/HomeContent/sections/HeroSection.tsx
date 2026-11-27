'use client'
import { fontStyle } from '@/lib/font-style'
import Image from 'next/image'
import { frameStyle, parseFrame } from '@/lib/image-frame'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { usePrefersReducedMotion } from '@/components/Motion/usePrefersReducedMotion'
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

export default function HeroSection({ gs, waLink }: { gs: Gs; t: Tr; waLink: string }) {
  const reduce = usePrefersReducedMotion()
  const parts = pecahJudul(gs('heroTitle', 'home.hero.title'))

  // Kaskade halus antar-elemen hero.
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduce ? 0 : 0.04, delayChildren: 0 } },
  }
  // Hanya menganimasikan transform (y/scale) — di-composite GPU & TIDAK menahan
  // cat pertama. `opacity` sengaja TETAP 1: judul & subtitle adalah konten
  // above-the-fold (elemen LCP = <p heroSubtitle>). Kalau di-fade dari opacity:0,
  // Framer merender varian `hidden` ke HTML SSR sehingga teks baru terlihat
  // SETELAH hydration — di CPU HP yang lambat itu melonjakkan LCP ke ~4,3 dtk
  // (di desktop hydration instan, jadi LCP tetap ~1 dtk; kode sama, CPU beda).
  // Kesan sinematik tetap terjaga lewat rise (slide) + pop (spring). `filter:
  // blur()` juga tetap DIHAPUS karena tak bisa di-composite.
  const rise: Variants = reduce
    ? { hidden: {}, visible: {} }
    : {
        hidden: { y: 24 },
        visible: { y: 0, transition: { duration: 0.75, ease: EASE } },
      }
  // Kata emas: sama seperti rise tapi dengan spring "pop".
  const pop: Variants = reduce
    ? rise
    : {
        hidden: { y: 24, scale: 0.9 },
        visible: {
          y: 0, scale: 1,
          transition: { type: 'spring', stiffness: 200, damping: 15, mass: 0.7 },
        },
      }
  // Elemen NON-LCP (garis emas + tombol) tetap beranimasi masuk walau judul &
  // subjudul (elemen LCP) sengaja diam lewat initial={false} di kontainer.
  // Key varian SELALU sama (scaleX/opacity, y) — hanya DURASI yang bergantung
  // `reduce`. usePrefersReducedMotion memberi `false` saat hidrasi lalu beralih
  // ke nilai asli; kalau varian reduce menghapus key-nya (mis. `visible: {}`),
  // tak ada target saat swap → transform server tersangkut. Dengan key tetap,
  // pengguna "kurangi gerakan" langsung ke posisi akhir (durasi 0), tanpa sisa.
  const accent: Variants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: reduce ? { duration: 0 } : { duration: 0.7, ease: EASE, delay: 0.15 },
    },
  }
  // Tombol: transform-only (opacity tetap 1) → langsung terlihat, tanpa CLS.
  const cta: Variants = {
    hidden: { y: 20 },
    visible: {
      y: 0,
      transition: reduce ? { duration: 0 } : { duration: 0.6, ease: EASE, delay: 0.25 },
    },
  }

  return (
    <section key="hero" className={styles.hero}>
      <div className={styles.heroImageWrapper}>
        <Image
          src={gs('heroBgImage', undefined, '/hero-coastal.webp')}
          // Tanda *…* = penanda sorotan kuning di CMS, bukan bagian teks.
          alt={String(gs('heroTitle', 'home.hero.title') || "Agendain — Biro Perjalanan Wisata Open Trip & Private Trip Eropa").replace(/\*/g, '')}
          fill
          priority
          fetchPriority="high"
          className={styles.heroImage}
          style={frameStyle(parseFrame(gs('heroBgImageFrame')))}
          quality={75}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
        />
        <div className={styles.heroOverlay} />
      </div>

      <motion.div className={styles.heroContent} variants={container} initial={false} animate="visible">
        <motion.h1
          className={styles.heroTitle}
          variants={container}
          style={fontStyle(gs, 'heroTitle')}
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

        <motion.div className={styles.heroAccent} variants={accent} initial="hidden" animate="visible" aria-hidden="true" />

        <motion.p
          className={styles.heroSubtitle}
          variants={rise}
          style={fontStyle(gs, 'heroSubtitle')}
        >
          {gs('heroSubtitle', 'home.hero.desc')}
        </motion.p>

        <motion.div className={styles.heroButtons} variants={cta} initial="hidden" animate="visible">
          <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.btnWhatsapp}>
            <WhatsAppIcon size={20} /> {gs('heroBtnWa', 'home.hero.btnWa')}
          </a>
          <Link href="/open-trip" className={styles.btnGold}>{gs('heroBtnPack', 'home.hero.btnPack')}</Link>
        </motion.div>
      </motion.div>

      {/* Scroll cue — muncul terakhir, memantul lembut (diam bila reduced-motion). */}
      <motion.div
        className={styles.heroScrollCue}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <motion.span
          animate={reduce ? undefined : { y: [0, 8, 0] }}
          transition={reduce ? undefined : { repeat: 1, duration: 1.0, ease: 'easeInOut' }}
        >
          <ChevronDown size={30} />
        </motion.span>
      </motion.div>
    </section>
  )
}
