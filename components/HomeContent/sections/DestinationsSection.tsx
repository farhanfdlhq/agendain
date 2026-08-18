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

export default function DestinationsSection({ gs, t, packages }: { gs: any, t: any, packages: any[] }) {
  return (
    <section key="destinations" className={styles.destSection}>
      <div className={styles.container}>
        <FadeIn direction="up">
          <div className={styles.destWrapper}>
            <div className={styles.destHeaderLeftWrapper}>
              <p className={styles.destEyebrow} style={gs('destEyebrowWeight') ? { fontWeight: Number(gs('destEyebrowWeight')) } : undefined}>{gs('destEyebrow', 'dest.subtitle', 'Eksplor Bersama Agendain')}</p>
              <h2 className={styles.destTitle} style={gs('destTitleWeight') ? { fontWeight: Number(gs('destTitleWeight')) } : undefined}>{renderHighlightedTitle(gs('destTitle', 'home.popularDest', 'Favorite Destination'))}</h2>
              <Link href="/open-trip" className={styles.destViewAll}>{t('home.exploreDest') || 'Lihat Semua Destinasi →'}</Link>
            </div>
        <Stagger className={styles.destGrid}>
          {((packages || []).length > 0 ? packages.slice(0, 3) : DESTINATIONS).map((pkg) => (
            <Link key={pkg.slug} href={`/open-trip/${pkg.slug}`} className={styles.destCard}>
              <div className={styles.destCardImageWrapper}>
                <Image src={pkg.fotoThumbnail || pkg.image || '/placeholder.webp'} alt={pkg.nama || pkg.name} fill className={styles.destCardImage}  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/>
              </div>
              <div className={styles.destCardBody}>
                <div className={styles.destCardTop}>
                  <h3 className={styles.destCardName}>{pkg.nama || pkg.name}</h3>
                  <span className={styles.destCardRating}>
                    <Star size={12} fill="#f59e0b" className={styles.destCardRatingStar} />
                    <span className={styles.destCardRatingText}>{pkg.rating || '5/5'}</span>
                  </span>
                </div>
                <div className={styles.destCardBottom}>
                  <div className={styles.destCardPriceWrapper}>
                    {pkg.harga || pkg.price ? (
                      <>
                        <div className={styles.destCardPriceLabel}>
                          <span>{t('home.dest.startFrom')?.split(' ')[0] || 'Start'}</span>
                          <span>{t('home.dest.startFrom')?.split(' ')[1] || 'From'}</span>
                        </div>
                        <span className={styles.destCardPriceValue}>{
                          pkg.harga 
                            ? `${(pkg.harga / 1000000).toLocaleString('id-ID')} Juta` 
                            : pkg.price
                        }</span>
                      </>
                    ) : (
                      <span className={styles.destCardPriceValue} style={{ fontSize: '1.25rem', paddingLeft: '0.5rem' }}>{t('nav.destinations')}</span>
                    )}
                  </div>
                  <span className={styles.destCardBooking}>{t('nav.cta') || 'Booking'}</span>
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
