"use client"

import Image from 'next/image'
import Link from 'next/link'
import styles from './DestinationCard.module.css'
import { useTranslation } from '@/lib/i18n/useTranslation'

interface DestinationProps {
  slug: string
  nama: string
  foto: string
  paketCount?: number
}

export default function DestinationCard({ slug, nama, foto, paketCount = 0 }: DestinationProps) {
  const { locale, translateData } = useTranslation()
  return (
    <Link href={`/destinasi/${slug}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image 
          src={foto || '/placeholder.png'} 
          alt={`Destinasi ${nama}`}
          fill
          sizes="(max-width: 744px) 100vw, (max-width: 1128px) 50vw, 33vw"
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.overlay} />
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{translateData(nama)}</h3>
        {paketCount > 0 && (
          <span className={styles.subtitle}>{paketCount} {locale === 'en' ? 'Packages Available' : 'Paket Tersedia'}</span>
        )}
      </div>
    </Link>
  )
}
