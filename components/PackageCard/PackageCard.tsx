"use client"

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Circle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { formatPriceShort } from '@/lib/currency'
import { pickLocalized } from '@/lib/i18n/localize'
import styles from './PackageCard.module.css'

interface PackageProps {
  id: number
  slug: string
  nama: string
  namaEn?: string | null
  harga: number
  durasi: number
  destinasi: { nama: string; namaEn?: string | null }
  fotoThumbnail: string
  label?: string | null
}

export default function PackageCard({ slug, nama, namaEn, harga, durasi, destinasi, fotoThumbnail }: PackageProps) {
  const { t, translateData, locale } = useTranslation()

  // Nama paket versi Inggris bila admin sudah mengisinya, kalau tidak tetap
  // memakai nama Indonesia.
  const localizedNama = pickLocalized({ nama, namaEn }, 'nama', locale) || nama

  const formattedHarga = formatPriceShort(harga, locale)

  // Format durasi
  const malam = durasi > 1 ? durasi - 2 : durasi - 1;
  const durasiText = `${durasi} ${t('openTrip.card.days')} ${malam > 0 ? malam : 0} ${t('openTrip.card.nights')}`;

  // Judul dipotong agar tinggi kartu tetap seragam di grid.
  const displayTitle = localizedNama.length > 25 ? localizedNama.substring(0, 25) + '...' : localizedNama;

  // "Mulai dari" / "Start From" ditumpuk dua baris, sama seperti kartu di beranda.
  const [startWord, fromWord] = (t('home.dest.startFrom') || 'Start From').split(' ')

  // Nama destinasi: utamakan kolom `namaEn` dari CMS, baru kamus 21 entri
  // di `translateData` sebagai jaring terakhir.
  const destName = (destinasi && pickLocalized(destinasi, 'nama', locale)) || ''
  const destLabel = translateData(destName) || 'Eropa'

  return (
    <Link href={`/open-trip/${slug}`} className={styles.destCard} suppressHydrationWarning aria-label={`${t('openTrip.card.ariaDetail')} ${localizedNama}`}>
      <div className={styles.destCardImageWrapper} suppressHydrationWarning>
        <Image
          src={fotoThumbnail || '/placeholder.webp'}
          alt={localizedNama}
          fill
          sizes="(max-width: 744px) 100vw, (max-width: 1128px) 50vw, 33vw"
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.locationBadge}>
          <MapPin size={12} strokeWidth={2.5} />
          <span>{destLabel}</span>
        </div>
      </div>

      <div className={styles.destCardBody} suppressHydrationWarning>
        <h3 className={styles.destCardName}>{displayTitle}</h3>

        <div className={styles.destCardPriceWrapper}>
          <div className={styles.destCardPriceLabel}>
            <span>{startWord}</span>
            <span>{fromWord}</span>
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
            {t('openTrip.card.seasonSpring')}
          </li>
          <li>
            <Circle size={10} className={styles.scheduleIcon} />
            {t('openTrip.card.seasonSummer')}
          </li>
          <li>
            <Circle size={10} className={styles.scheduleIcon} />
            {t('openTrip.card.seasonAutumn')}
          </li>
        </ul>

        <div className={styles.destCardBottom} suppressHydrationWarning>
          <span className={styles.destCardBooking}>{t('nav.contact')}</span>
        </div>
      </div>
    </Link>
  )
}
