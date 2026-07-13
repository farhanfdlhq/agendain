"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
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

  // Format harga to IDR
  const formattedHarga = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(harga)

  return (
    <div className={styles.card} suppressHydrationWarning>
      <Link href={`/paket/${slug}`} className={styles.cardLink} aria-label={`Lihat detail paket ${nama}`} />
      <div className={styles.imageWrapper} suppressHydrationWarning>
        <Image 
          src={fotoThumbnail || '/placeholder.webp'} 
          alt={nama} 
          fill 
          sizes="(max-width: 744px) 100vw, (max-width: 1128px) 50vw, 25vw"
          className={styles.image} 
          loading="lazy"
        />
      </div>
      
      {label && <div className={styles.badge} suppressHydrationWarning>{translateData(label)}</div>}
      
      <div className={styles.content} suppressHydrationWarning>
        <div className={styles.metaRow} suppressHydrationWarning>
          <span className={styles.destination}>{translateData(destinasi?.nama) || (locale === 'en' ? 'Europe' : 'Eropa')}</span>
          <span className={styles.duration}>{durasi} {locale === 'en' ? 'Days' : 'Hari'}</span>
        </div>
        <h3 className={styles.title}>{nama}</h3>
        <div className={styles.footer} suppressHydrationWarning>
          <div className={styles.priceContainer}>
            <span className={styles.price}>{formattedHarga}</span>
            <span className={styles.unit}>/ pax</span>
          </div>
          <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className={styles.contactBtn} aria-label="Hubungi Kami">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            Hubungi
          </a>
        </div>
      </div>
    </div>
  )
}
