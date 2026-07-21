"use client"

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Circle } from 'lucide-react'
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

export default function PackageCard({ slug, nama, harga, durasi, destinasi, fotoThumbnail }: PackageProps) {
  const { t, translateData } = useTranslation()

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

  // Format durasi
  const malam = durasi > 1 ? durasi - 2 : durasi - 1;
  const durasiText = `${durasi} Hari ${malam > 0 ? malam : 0} Malam`;

  // Parse title: in the db it might be "Eksplorasi Eropa Barat", but the user wants it to look like "Roma".
  // For the sake of the card's visual parity with the mockup, we will use the first word or the provided name.
  // We can just use `nama`, but the mockup specifically shows short titles like "Roma", "Matterhorn", "Venesia".
  // Since we use the DB data, we'll render `nama` directly.
  const displayTitle = nama.length > 25 ? nama.substring(0, 25) + '...' : nama;

  return (
    <Link href={`/open-trip/${slug}`} className={styles.destCard} suppressHydrationWarning aria-label={`Lihat detail paket ${nama}`}>
      <div className={styles.destCardImageWrapper} suppressHydrationWarning>
        <Image 
          src={fotoThumbnail || '/placeholder.webp'} 
          alt={nama} 
          fill 
          sizes="(max-width: 744px) 100vw, (max-width: 1128px) 50vw, 33vw"
          className={styles.image} 
          loading="lazy"
        />
        <div className={styles.locationBadge}>
          <MapPin size={12} strokeWidth={2.5} />
          <span>{translateData(destinasi?.nama) || 'Eropa'}</span>
        </div>
      </div>
      
      <div className={styles.destCardBody} suppressHydrationWarning>
        <h3 className={styles.destCardName}>{displayTitle}</h3>
        
        <div className={styles.destCardPriceWrapper}>
          <div className={styles.destCardPriceLabel}>
            <span>Start</span>
            <span>From</span>
          </div>
          <span className={styles.destCardPriceValue}>{formattedHarga}</span>
        </div>

        <ul className={styles.scheduleList}>
          <li>
            <Circle size={10} className={styles.scheduleIcon} />
            {durasiText}
          </li>
          <li>
            <Circle size={10} className={styles.scheduleIcon} />
            Spring 11 April | 23 Mei
          </li>
          <li>
            <Circle size={10} className={styles.scheduleIcon} />
            Summer 6 Juni - 19 Sept
          </li>
          <li>
            <Circle size={10} className={styles.scheduleIcon} />
            Autumn 17 Okt - 28 Nov
          </li>
        </ul>

        <div className={styles.destCardBottom} suppressHydrationWarning>
          <span className={styles.destCardBooking}>Hubungi Kami</span>
        </div>
      </div>
    </Link>
  )
}
