'use client'
import { useId, useRef, useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { Plane } from 'lucide-react'
import { fontStyle, fontStyleFrom } from '@/lib/font-style'
import type { Gs, HomeSettings, Tr } from '../types'
import type { CmsRow } from '@/lib/types/cms'
import FadeIn from '@/components/Motion/FadeIn'
import { usePrefersReducedMotion } from '@/components/Motion/usePrefersReducedMotion'
import styles from '../HomeContent.module.css'
import { renderHighlightedTitle } from '../shared'
import { localizeRepeater, HOME_REPEATERS } from '@/lib/i18n/localize'

const getWhyCards = (t: Tr): CmsRow[] => [
  { title: t('home.why1.title'), desc: t('home.why1.desc') },
  { title: t('home.why2.title'), desc: t('home.why2.desc') },
  { title: t('home.why3.title'), desc: t('home.why3.desc') },
  { title: t('home.why4.title'), desc: t('home.why4.desc') },
]

/*
 * Peta "Kenapa Agendain": tangan memegang peta Eropa naik dari bawah saat
 * di-scroll, lalu pesawat datang dari utara dan meninggalkan jejak titik-titik
 * yang melengkung mulus melewati empat kota. Tiap kota = satu keunggulan:
 *   1 London, 2 Roma, 3 Istanbul, 4 Stockholm (bentuk U, tanpa garis bersilang).
 * Kartu ditaruh di kuadran luar peta (kiri atas, kiri bawah, kanan bawah,
 * kanan atas) supaya tidak menutupi rute maupun titik.
 * Koordinat = piksel gambar /why-map.webp (2000 x 1116).
 * Animasi scroll berjalan di semua perangkat. Desktop (>= 1024px): kartu di
 * atas peta. Tablet & HP: satu kartu di bawah peta yang berganti mengikuti
 * titik yang sedang dicapai, plus indikator 1-4. Pengguna "kurangi gerakan"
 * mendapat versi lembut (hanya memudar, tanpa peta naik & pesawat). Peta tampil
 * diam (dengan daftar kartu) hanya bila layar terlalu pendek (HP miring).
 */
const MAP_W = 2000
const MAP_H = 1116

type Pt = [number, number]
// Titik pertama = asal pesawat (di atas peta), sisanya = titik 1-4.
// Titik awal di tepi atas kertas peta (tidak menembus judul section).
const ROUTE_PTS: Pt[] = [
  [860, 112],
  [848, 578],
  [1000, 832],
  [1232, 809],
  [1112, 418],
]
const PINS = ROUTE_PTS.slice(1)

// Kurva Catmull-Rom → kubik Bezier: lengkung mulus yang tetap melewati setiap titik.
type Seg = [Pt, Pt, Pt, Pt]
const SEGS: Seg[] = ROUTE_PTS.slice(0, -1).map((p1, i) => {
  const p0 = ROUTE_PTS[i - 1] ?? p1
  const p2 = ROUTE_PTS[i + 1]
  const p3 = ROUTE_PTS[i + 2] ?? p2
  const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
  const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
  return [p1, c1, c2, p2]
})
const ROUTE_D = `M${ROUTE_PTS[0].join(' ')} ` + SEGS.map(([, c1, c2, p2]) => `C${c1.join(' ')} ${c2.join(' ')} ${p2.join(' ')}`).join(' ')

// Sampel lintasan (dihitung sekali, tanpa DOM) untuk posisi pesawat dan kapan
// tiap titik dicapai. Panjang dihitung dalam piksel gambar.
const bez = ([p0, p1, p2, p3]: Seg, t: number): Pt => {
  const u = 1 - t
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]
}
const SAMPLES: { x: number; y: number; len: number }[] = []
const PIN_LEN: number[] = []
{
  let len = 0
  let prev: Pt | null = null
  for (const seg of SEGS) {
    for (let k = prev ? 1 : 0; k <= 60; k++) {
      const pt = bez(seg, k / 60)
      if (prev) len += Math.hypot(pt[0] - prev[0], pt[1] - prev[1])
      SAMPLES.push({ x: pt[0], y: pt[1], len })
      prev = pt
    }
    PIN_LEN.push(len)
  }
}
const TOTAL = SAMPLES[SAMPLES.length - 1].len
const PIN_FRAC = PIN_LEN.map((l) => l / TOTAL)

const pointAt = (frac: number) => {
  const target = frac * TOTAL
  let i = SAMPLES.findIndex((s) => s.len >= target)
  if (i <= 0) i = 1
  const a = SAMPLES[i - 1]
  const b = SAMPLES[i]
  const k = b.len === a.len ? 0 : (target - a.len) / (b.len - a.len)
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI }
}

// Tahap animasi (progres scroll 0..1) pada mode cerita: peta naik sampai
// RISE_END, rute langsung menyusul supaya tidak ada scroll tanpa gerakan.
const RISE_END = 0.24
const ROUTE_RANGE: [number, number] = [0.26, 0.9]
const reachAt = (frac: number) => ROUTE_RANGE[0] + frac * (ROUTE_RANGE[1] - ROUTE_RANGE[0])
const PIN_AT = PIN_FRAC.map(reachAt)

// Kartu di kuadran luar peta; `top` = titik tengah kartu (CSS menggeser -50%).
const CARD_POS = [
  { right: '62%', top: '37%' },
  { right: '56%', top: '81%' },
  { left: '65.5%', top: '79%' },
  { left: '60%', top: '27%' },
]

function useMedia(query: string, serverValue: boolean) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query)
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  )
}

const pct = (v: number, total: number) => `${(v / total) * 100}%`
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

// Semua efek dihitung dari SATU nilai progres lewat fungsi (bukan rentang
// [a, b] → [x, y]). Bentuk rentang membuat motion memindahkan opacity ke
// ScrollTimeline/ViewTimeline bawaan browser, yang rentangnya berbeda dari
// offset useScroll, sehingga peta memudar/petunjuk muncul lagi tidak sinkron.
function useRamp(progress: MotionValue<number>, a: number, b: number, from = 0, to = 1) {
  return useTransform(progress, (p) => from + (to - from) * clamp01((p - a) / (b - a)))
}

// `gentle` = pengguna "kurangi gerakan": elemen hanya memudar masuk, tanpa
// membesar/bergeser.
function Pin({ n, x, y, progress, at, gentle }: { n: number; x: number; y: number; progress: MotionValue<number>; at: number; gentle: boolean }) {
  const reveal = useRamp(progress, at - 0.015, at + 0.025)
  // Kunci style selalu sama (scale + opacity); hanya nilainya yang berganti.
  // Mengganti kunci setelah hidrasi meninggalkan transform lama dari HTML server.
  const style = { left: pct(x, MAP_W), top: pct(y, MAP_H), scale: gentle ? 1 : reveal, opacity: gentle ? reveal : 1 }
  return (
    <motion.span className={styles.whyPin} style={style} aria-hidden="true">
      {n}
    </motion.span>
  )
}

function CardBody({ card, n }: { card: CmsRow; n: number }) {
  return (
    <>
      <div className={styles.whyCardHead}>
        <span className={styles.whyCardNum} aria-hidden="true">{n}</span>
        <h3 className={styles.whyMapCardTitle} style={fontStyleFrom(card.titleWeight, card.titleSize)}>{card.title}</h3>
      </div>
      {card.desc && <p className={styles.whyMapCardDesc} style={fontStyleFrom(card.descWeight, card.descSize)}>{card.desc}</p>}
    </>
  )
}

function StoryCard({ card, i, progress, gentle }: { card: CmsRow; i: number; progress: MotionValue<number>; gentle: boolean }) {
  const at = PIN_AT[i]
  const opacity = useRamp(progress, at, at + 0.045)
  const y = useRamp(progress, at, at + 0.045, gentle ? 0 : 12, 0)
  return (
    <motion.div className={styles.whyMapCard} style={{ ...CARD_POS[i], opacity, y }}>
      <CardBody card={card} n={i + 1} />
    </motion.div>
  )
}

export default function WhySection({ gs, t, locale, homeSettings }: { gs: Gs, t: Tr, locale: string, homeSettings: HomeSettings }) {
  const whyItems = localizeRepeater(homeSettings, 'whyItems', locale, HOME_REPEATERS.whyItems) ?? getWhyCards(t)
  const mapCards = whyItems.slice(0, 4)
  const extraCards = whyItems.slice(4)

  const wide = useMedia('(min-width: 1024px)', false)
  const tall = useMedia('(min-height: 520px)', true)
  // "Kurangi gerakan" tetap mendapat cerita scroll versi lembut: rute terbuka,
  // titik & kartu memudar masuk; tanpa peta naik/membesar dan tanpa pesawat.
  const gentle = usePrefersReducedMotion()
  const story = tall
  const [active, setActive] = useState(-1)
  const maskId = `why-route-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  const trackRef = useRef<HTMLDivElement>(null)
  const planeRef = useRef<HTMLSpanElement>(null)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })
  // Pegas meredam lompatan roda mouse supaya peta, rute, dan kartu bergerak halus.
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.7, restDelta: 0.0005 })
  const done = useMotionValue(1)
  const base = story ? smooth : done
  // Mode lembut tidak punya fase peta naik: timeline digeser supaya rute
  // langsung terbuka sejak awal scroll.
  const skipRise = useTransform(base, (p) => RISE_END + p * (1 - RISE_END))
  const progress = gentle ? skipRise : base

  const hintOpacity = useRamp(base, 0, 0.06, 1, 0)
  const mapY = useTransform(progress, (p) => `${30 * (1 - clamp01((p - 0.02) / (RISE_END - 0.02)))}%`)
  const mapScale = useRamp(progress, 0.02, RISE_END, 0.86, 1)
  const routeDrawn = useRamp(progress, ROUTE_RANGE[0], ROUTE_RANGE[1])

  // Tablet/HP: kartu aktif = titik terakhir yang sudah dicapai rute.
  useMotionValueEvent(progress, 'change', (p) => {
    const idx = PIN_AT.filter((at) => p >= at).length - 1
    setActive((prev) => (prev === idx ? prev : idx))
  })

  // Pesawat mengikuti ujung jejak titik-titik, lalu menghilang setelah tiba.
  useMotionValueEvent(routeDrawn, 'change', (f) => {
    const plane = planeRef.current
    if (!plane) return
    const fade = Math.min(clamp01(f / 0.04), clamp01((1 - f) / 0.06))
    plane.style.opacity = String(fade)
    if (fade <= 0) return
    const { x, y, angle } = pointAt(f)
    plane.style.left = pct(x, MAP_W)
    plane.style.top = pct(y, MAP_H)
    plane.style.transform = `translate(-50%, -50%) rotate(${angle + 45}deg)`
  })

  const header = (
    <div className={styles.whySectionHeader}>
      <span className={styles.whyTitleMain} style={fontStyle(gs, 'whyTitleMain')}>{renderHighlightedTitle(gs('whyTitleMain', 'home.why.eyebrow'))}</span>
      <h2 className={styles.whyTitleSub} style={fontStyle(gs, 'whyTitleSub')}>{renderHighlightedTitle(gs('whyTitleSub', 'home.whyTitle'))}</h2>
    </div>
  )

  // Peta tanpa fade-in: sejak awal sudah mengintip dari bawah, jadi panggung
  // tidak kosong saat section baru masuk layar.
  const map = (
    <motion.div
      className={styles.whyMapBox}
      style={story && !gentle ? { y: mapY, scale: mapScale } : { y: '0%', scale: 1 }}
    >
      <Image
        src="/why-map.webp"
        alt={t('home.why.mapAlt')}
        fill
        className={styles.whyMapImg}
        // HP: peta 128% lebar layar (melewati tepi), jadi minta gambar 130vw.
        sizes="(min-width: 1024px) 1100px, (max-width: 640px) 130vw, 100vw"
      />
      <svg className={styles.whyRoute} viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="none" aria-hidden="true">
        {/* Jejak titik-titik terbuka bertahap: masker garis utuh yang memanjang. */}
        <mask id={maskId} maskUnits="userSpaceOnUse" x={-200} y={-300} width={MAP_W + 400} height={MAP_H + 600}>
          <motion.path d={ROUTE_D} className={styles.whyRouteMask} style={{ pathLength: routeDrawn }} />
        </mask>
        <path d={ROUTE_D} className={styles.whyRouteDots} mask={`url(#${maskId})`} />
      </svg>
      {PINS.map((p, i) => (
        <Pin key={i} n={i + 1} x={p[0]} y={p[1]} progress={progress} at={PIN_AT[i]} gentle={gentle} />
      ))}
      {story && !gentle && (
        <span ref={planeRef} className={styles.whyPlane} aria-hidden="true">
          <Plane size={18} strokeWidth={2.4} />
        </span>
      )}
      {story && wide && mapCards.map((card, i) => <StoryCard key={i} card={card} i={i} progress={progress} gentle={gentle} />)}
    </motion.div>
  )

  const list = (cards: CmsRow[], offset: number) => (
    <ol className={styles.whyMapList}>
      {cards.map((card, i) => (
        <FadeIn key={i + offset} direction="up" delay={i * 0.06}>
          <li className={styles.whyMapListItem}>
            <CardBody card={card} n={i + offset + 1} />
          </li>
        </FadeIn>
      ))}
    </ol>
  )

  // Tablet/HP: satu kartu di bawah peta, berganti halus mengikuti titik aktif.
  const panel = (
    <div className={styles.whyActivePanel}>
      <div className={styles.whyActiveSlot} aria-hidden="true">
        {/* Salinan tak terlihat: slot setinggi kartu tertinggi, jadi peta tidak
            bergeser saat kartu berganti (teks kartu bisa diubah lewat CMS). */}
        {mapCards.map((card, i) => (
          <div key={`sizer-${i}`} className={`${styles.whyMapListItem} ${styles.whySlotSizer}`}>
            <CardBody card={card} n={i + 1} />
          </div>
        ))}
        <AnimatePresence mode="wait" initial={false}>
          {active >= 0 && mapCards[active] && (
            <motion.div
              key={active}
              className={styles.whyMapListItem}
              initial={{ opacity: 0, y: gentle ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: gentle ? 0 : -10 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <CardBody card={mapCards[active]} n={active + 1} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className={styles.whyDots} aria-hidden="true">
        {mapCards.map((_, i) => (
          <span key={i} className={i <= active ? styles.whyDotOn : styles.whyDot} />
        ))}
      </div>
    </div>
  )

  if (story) {
    return (
      <section key="why" className={styles.whySection}>
        <div ref={trackRef} className={styles.whyTrack}>
          <div className={styles.whySticky}>
            <div className={styles.container}>{header}</div>
            <div className={wide ? styles.whyStage : `${styles.whyStage} ${styles.whyStageNarrow}`}>
              {map}
              {!wide && panel}
              <motion.p className={styles.whyScrollHint} style={{ opacity: hintOpacity }} aria-hidden="true">
                {t('home.why.scrollHint')}
              </motion.p>
            </div>
          </div>
        </div>
        {/* Di tablet/HP hanya satu kartu yang tampil; daftar lengkap tetap ada
            untuk pembaca layar dan mesin pencari. */}
        {!wide && <div className={styles.whySrOnly}>{list(mapCards, 0)}</div>}
        {extraCards.length > 0 && <div className={styles.container}>{list(extraCards, 4)}</div>}
      </section>
    )
  }

  return (
    <section key="why" className={styles.whySection}>
      <div ref={trackRef} className={styles.container}>
        <FadeIn direction="up">{header}</FadeIn>
        <FadeIn direction="up" delay={0.1}>
          <div className={styles.whyStageStatic}>{map}</div>
        </FadeIn>
        {list(whyItems, 0)}
      </div>
    </section>
  )
}
