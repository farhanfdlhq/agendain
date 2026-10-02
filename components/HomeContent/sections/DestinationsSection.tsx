'use client'
import { fontStyle } from '@/lib/font-style'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import FadeIn from '@/components/Motion/FadeIn'
import Stagger from '@/components/Motion/Stagger'
import PackageCard from '@/components/PackageCard/PackageCard'
import type { OpenTripCardData } from '@/lib/open-trip-card'
import styles from '../HomeContent.module.css'
import { renderHighlightedTitle } from '../shared'

/**
 * Destinasi Favorit — 3 open trip terbaru dari DB, memakai kartu yang SAMA
 * dengan halaman /open-trip (components/PackageCard). Tidak ada data contoh:
 * bila belum ada paket terbit, section hanya menampilkan kepala + tombol.
 */
export default function DestinationsSection({ gs, packages }: {
  gs: (key: string, fallbackTKey?: string, defaultStatic?: string) => string
  packages: OpenTripCardData[]
}) {
  return (
    <section key="destinations" className={styles.destSection}>
      <div className={styles.container}>
        <FadeIn direction="up">
          <div className={styles.destHead}>
            <div>
              <p className={styles.destEyebrow} style={fontStyle(gs, 'destEyebrow')}>{gs('destEyebrow', 'dest.subtitle', 'Eksplor Bersama Agendain')}</p>
              <h2 className={styles.destTitle} style={fontStyle(gs, 'destTitle')}>{renderHighlightedTitle(gs('destTitle', 'home.popularDest', 'Favorite Destination'))}</h2>
            </div>
            <Link href="/open-trip" className={styles.destViewAll}>
              {gs('destBtn', 'home.exploreDest')}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </FadeIn>
        {packages.length > 0 && (
          <Stagger className={styles.destGrid}>
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} {...pkg} />
            ))}
          </Stagger>
        )}
      </div>
    </section>
  )
}
