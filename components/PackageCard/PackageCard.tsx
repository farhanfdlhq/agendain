"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import styles from './PackageCard.module.css'

interface PackageProps {
  id: number
  slug: string
  nama: string
  harga: number
  durasi: number
  destinasi: { nama: string }
  fotoThumbnail: string
  label?: string | null
}

export default function PackageCard({ slug, nama, harga, durasi, destinasi, fotoThumbnail, label }: PackageProps) {
  const { t, locale, translateData } = useTranslation()

  // Format harga to IDR in a shorter way, e.g. 18 Juta if possible, else full format
  let formattedHarga = ''
  if (harga >= 1000000 && harga % 1000000 === 0) {
    formattedHarga = `${harga / 1000000} Juta`
  } else {
    formattedHarga = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(harga)
  }

  return (
    <Link href={`/paket/${slug}`} className={styles.destCard} suppressHydrationWarning aria-label={`Lihat detail paket ${nama}`}>
      <div className={styles.destCardImageWrapper} suppressHydrationWarning>
        <Image 
          src={fotoThumbnail || '/placeholder.webp'} 
          alt={nama} 
          fill 
          sizes="(max-width: 744px) 100vw, (max-width: 1128px) 50vw, 33vw"
          className={styles.image} 
          loading="lazy"
        />
      </div>
      <div className={styles.destCardBody} suppressHydrationWarning>
        <div className={styles.destCardTop} suppressHydrationWarning>
          <h3 className={styles.destCardName}>{translateData(destinasi?.nama) || nama}</h3>
          <span className={styles.destCardRating}>
            <Star size={12} fill="#f59e0b" className={styles.destCardRatingStar} />
            <span className={styles.destCardRatingText}>5/5</span>
          </span>
        </div>
        <div className={styles.destCardBottom} suppressHydrationWarning>
          <div className={styles.destCardPriceWrapper}>
            <div className={styles.destCardPriceLabel}>
              {t('home.dest.startFrom').split(' ').map((word: string, i: number) => (
                <span key={i}>{word}</span>
              ))}
            </div>
            <span className={styles.destCardPriceValue}>{formattedHarga}</span>
          </div>
          <span className={styles.destCardBooking}>Booking</span>
        </div>
      </div>
    </Link>
  )
}
