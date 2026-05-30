import Image from 'next/image'
import Link from 'next/link'
import styles from './DestinationCard.module.css'

interface DestinationProps {
  slug: string
  nama: string
  foto: string
  paketCount?: number
}

export default function DestinationCard({ slug, nama, foto, paketCount = 0 }: DestinationProps) {
  return (
    <Link href={`/destinasi/${slug}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image 
          src={foto || 'https://images.unsplash.com/photo-1522709772396-9812dd683db9?q=80&w=800&auto=format&fit=crop'} 
          alt={`Destinasi ${nama}`}
          fill
          sizes="(max-width: 744px) 100vw, (max-width: 1128px) 50vw, 33vw"
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.overlay} />
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{nama}</h3>
        {paketCount > 0 && (
          <span className={styles.subtitle}>{paketCount} Paket Tersedia</span>
        )}
      </div>
    </Link>
  )
}
