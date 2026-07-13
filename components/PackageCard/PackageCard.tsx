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
  const [isSaved, setIsSaved] = useState(false)
  const { t, locale, translateData } = useTranslation()

  // Format harga to IDR
  const formattedHarga = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(harga)

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent Link navigation
    setIsSaved(!isSaved)
  }

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
      
      <button 
        className={`${styles.saveBtn} ${isSaved ? styles.saved : ''}`} 
        onClick={handleSave}
        aria-label={isSaved ? "Hapus dari favorit" : "Simpan ke favorit"}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill={isSaved ? "currentColor" : "rgba(0,0,0,0.3)"}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
      <div className={styles.content} suppressHydrationWarning>
        <div className={styles.metaRow} suppressHydrationWarning>
          <span className={styles.destination}>{translateData(destinasi?.nama) || (locale === 'en' ? 'Europe' : 'Eropa')}</span>
          <span className={styles.duration}>{durasi} {locale === 'en' ? 'Days' : 'Hari'}</span>
        </div>
        <h3 className={styles.title}>{nama}</h3>
        <div className={styles.footer} suppressHydrationWarning>
          <span className={styles.price}>{formattedHarga}</span>
          <span className={styles.unit}>/ pax</span>
        </div>
      </div>
    </div>
  )
}
