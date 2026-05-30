import Image from 'next/image'
import Link from 'next/link'
import styles from './PackageCard.module.css'

interface PackageProps {
  id: number
  slug: string
  nama: string
  harga: number
  durasi: number
  destinasi: { nama: string }
  fotoThumbnail: string
}

export default function PackageCard({ slug, nama, harga, durasi, destinasi, fotoThumbnail }: PackageProps) {
  // Format harga to IDR
  const formattedHarga = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(harga)

  return (
    <Link href={`/paket/${slug}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image 
          src={fotoThumbnail || 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop'} 
          alt={nama} 
          fill 
          sizes="(max-width: 744px) 100vw, (max-width: 1128px) 50vw, 25vw"
          className={styles.image} 
          loading="lazy"
        />
        <div className={styles.badge}>Terlaris</div>
        <button className={styles.saveBtn} aria-label="Simpan">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="rgba(0,0,0,0.3)">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
      <div className={styles.content}>
        <div className={styles.metaRow}>
          <span className={styles.destination}>{destinasi?.nama || 'Eropa'}</span>
          <span className={styles.duration}>{durasi} Hari</span>
        </div>
        <h3 className={styles.title}>{nama}</h3>
        <div className={styles.footer}>
          <span className={styles.price}>{formattedHarga}</span>
          <span className={styles.unit}>/ pax</span>
        </div>
      </div>
    </Link>
  )
}
