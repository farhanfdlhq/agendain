'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import FadeIn from '@/components/Motion/FadeIn'
import Stagger from '@/components/Motion/Stagger'
import styles from '../HomeContent.module.css'
import { renderHighlightedTitle } from '../shared'

const DESTINATIONS = [
  { name: 'France', price: '18 Juta', rating: '5/5', image: '/dest-france.webp', slug: 'prancis' },
  { name: 'Swiss', price: '24 Juta', rating: '5/5', image: '/dest-swiss.webp', slug: 'swiss' },
  { name: 'Italy', price: '20 Juta', rating: '5/5', image: '/dest-italy.webp', slug: 'italia' },
]

export default function DestinationsSection({ gs, t, destinations }: { gs: any, t: any, destinations: any[] }) {
  return (
    <section key="destinations" className={styles.destSection}>
      <div className={styles.container}>
        <FadeIn direction="up">
          <div className={styles.destWrapper}>
            <div className={styles.destHeaderLeftWrapper}>
              <p className={styles.destEyebrow}>{gs('destEyebrow', undefined, 'Eksplor Bersama Agendain')}</p>
              <h2 className={styles.destTitle}>{renderHighlightedTitle(gs('destTitle', undefined, 'Favorite Destination'))}</h2>
              <p className={styles.destSubtitleSmall}>From</p>
              <Link href="/destinasi" className={styles.destViewAll}>Lihat Semua Destinasi &rarr;</Link>
            </div>
        <Stagger className={styles.destGrid}>
          {(destinations.length > 0 ? destinations : DESTINATIONS).map((dest) => (
            <Link key={dest.slug} href={`/destinasi/${dest.slug}`} className={styles.destCard}>
              <div className={styles.destCardImageWrapper}>
                <Image src={dest.foto || dest.image || '/placeholder.webp'} alt={dest.nama || dest.name} fill className={styles.destCardImage} />
              </div>
              <div className={styles.destCardBody}>
                <div className={styles.destCardTop}>
                  <h3 className={styles.destCardName}>{dest.nama || dest.name}</h3>
                  <span className={styles.destCardRating}>
                    <Star size={12} fill="#f59e0b" className={styles.destCardRatingStar} />
                    <span className={styles.destCardRatingText}>{dest.rating || '5/5'}</span>
                  </span>
                </div>
                <div className={styles.destCardBottom}>
                  <div className={styles.destCardPriceWrapper}>
                    <div className={styles.destCardPriceLabel}>
                      <span>Start</span>
                      <span>From</span>
                    </div>
                    <span className={styles.destCardPriceValue}>{dest.openTripCount ? `${dest.openTripCount} Paket` : (dest.price || 'Lihat')}</span>
                  </div>
                  <span className={styles.destCardBooking}>Booking</span>
                </div>
              </div>
            </Link>
          ))}
        </Stagger>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
