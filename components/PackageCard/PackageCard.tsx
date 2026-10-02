"use client"

import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, Clock, Users } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { formatIDR } from '@/lib/currency'
import { pickLocalized } from '@/lib/i18n/localize'
import type { OpenTripCardData } from '@/lib/open-trip-card'
import styles from './PackageCard.module.css'

type PackageCardProps = OpenTripCardData & {
  /** Kartu di atas lipatan (mis. beranda) boleh dimuat lebih awal. */
  priority?: boolean
}

/**
 * Kartu open trip — dipakai beranda (Destinasi Favorit) & /open-trip.
 * Semua isi dari DB (lib/open-trip-card.ts); baris yang datanya kosong
 * disembunyikan, bukan diisi teks contoh.
 */
export default function PackageCard({
  slug, nama, namaEn, harga, durasi, destinasi, fotoThumbnail, label,
  tanggalKeberangkatan, kuota, kursiTerisi = 0, priority = false,
}: PackageCardProps) {
  const { t, translateData, locale } = useTranslation()

  const localizedNama = pickLocalized({ nama, namaEn }, 'nama', locale) || nama
  const destName = (destinasi && pickLocalized(destinasi, 'nama', locale)) || ''
  const destLabel = translateData(destName) || destName

  const malam = Math.max(durasi > 1 ? durasi - 2 : durasi - 1, 0)
  const durasiText = `${durasi} ${t('openTrip.card.days')} ${malam} ${t('openTrip.card.nights')}`

  // Tanggal yang sudah lewat tidak dipajang sebagai jadwal.
  const dep = tanggalKeberangkatan ? new Date(tanggalKeberangkatan) : null
  const isUpcoming = !!dep && dep.getTime() >= new Date().setHours(0, 0, 0, 0)
  const depText = isUpcoming
    ? new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(dep!)
    : null

  const sisa = typeof kuota === 'number' && kuota > 0 ? Math.max(kuota - kursiTerisi, 0) : null
  const seatText = sisa === null ? null
    : sisa === 0 ? t('openTrip.card.seatsFull')
    : t('openTrip.card.seatsLeft').replace('{n}', String(sisa))

  return (
    <Link
      href={`/open-trip/${slug}`}
      className={styles.card}
      aria-label={`${t('openTrip.card.ariaDetail')} ${localizedNama}`}
    >
      <div className={styles.media}>
        <Image
          src={fotoThumbnail || '/placeholder.webp'}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          className={styles.image}
          priority={priority}
        />
        {label && <span className={styles.badge}>{label}</span>}
      </div>

      <div className={styles.body}>
        {destLabel && <p className={styles.dest}>{destLabel}</p>}
        <h3 className={styles.title}>{localizedNama}</h3>
        <span className={styles.chip}>
          <Clock size={14} aria-hidden="true" />
          {durasiText}
        </span>

        <ul className={styles.facts}>
          <li>
            <CalendarDays size={16} aria-hidden="true" className={styles.factIcon} />
            {depText ? (
              <span><strong>{t('openTrip.card.departure')}</strong> {depText}</span>
            ) : (
              <span>{t('openTrip.card.scheduleTba')}</span>
            )}
          </li>
          {seatText && (
            <li className={sisa !== null && sisa <= 5 ? styles.factUrgent : undefined}>
              <Users size={16} aria-hidden="true" className={styles.factIcon} />
              <span>{seatText}</span>
            </li>
          )}
        </ul>
      </div>

      <div className={styles.footer}>
        <div className={styles.price}>
          <span className={styles.priceLabel}>{t('openTrip.card.priceFrom')}</span>
          <span className={styles.priceValue}>
            {formatIDR(harga)} <small>{t('openTrip.card.perPax')}</small>
          </span>
        </div>
        <span className={styles.cta} aria-hidden="true">{t('openTrip.card.viewDetail')}</span>
      </div>
    </Link>
  )
}
