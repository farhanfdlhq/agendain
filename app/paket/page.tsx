import PackageCard from '@/components/PackageCard/PackageCard'
import PaketFilter from '@/components/PaketFilter/PaketFilter'
import HeroHeader from '@/components/HeroHeader/HeroHeader'
import styles from './page.module.css'
import { prisma } from '@/lib/prisma'

export default async function PaketPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const params = await searchParams
  const destinasiFilter = params?.destinasi as string
  const durasiFilter = params?.durasi as string
  const urutkanFilter = params?.urutkan as string
  
  // Build query
  const where: any = { status: 'published' }
  if (destinasiFilter) {
    where.destinasi = {
      nama: {
        contains: destinasiFilter
      }
    }
  }

  if (durasiFilter) {
    if (durasiFilter === '5-7') {
      where.durasi = { gte: 5, lte: 7 }
    } else if (durasiFilter === '8-10') {
      where.durasi = { gte: 8, lte: 10 }
    } else if (durasiFilter === '11+') {
      where.durasi = { gte: 11 }
    }
  }

  let orderBy: any = { createdAt: 'desc' }
  if (urutkanFilter === 'termurah') {
    orderBy = { harga: 'asc' }
  } else if (urutkanFilter === 'termahal') {
    orderBy = { harga: 'desc' }
  }
  
  let packages: any[] = []
  let destList: string[] = []
  
  try {
    const dbDest = await prisma.destinasi.findMany({ select: { nama: true } })
    destList = dbDest.map((d: { nama: string }) => d.nama)

    const dbPackages = await prisma.paket.findMany({
      where,
      include: { destinasi: true },
      orderBy

    })
    
    packages = dbPackages.map((p: any) => {
      const foto = p.foto as any;
      return {
        ...p,
        harga: Number(p.harga),
        fotoThumbnail: foto?.thumb || foto?.medium || '/placeholder.webp'
      }
    })
  } catch (error) {
    console.error('DB fetch failed', error)
  }

  // Fallback for empty DB
  if (packages.length === 0) {
    packages = [
      { id: 1, slug: 'romantic-paris-5d', nama: 'Romantic Paris 5 Days', harga: 15000000, durasi: 5, destinasi: { nama: 'Prancis' }, fotoThumbnail: '/placeholder.webp' },
      { id: 2, slug: 'swiss-alps-7d', nama: 'Swiss Alps Adventure 7D', harga: 22000000, durasi: 7, destinasi: { nama: 'Swiss' }, fotoThumbnail: '/placeholder.webp' },
      { id: 3, slug: 'classic-italy-8d', nama: 'Classic Italy 8 Days', harga: 18500000, durasi: 8, destinasi: { nama: 'Italia' }, fotoThumbnail: '/placeholder.webp' },
      { id: 4, slug: 'london-scotland-10d', nama: 'London & Scotland 10D', harga: 28000000, durasi: 10, destinasi: { nama: 'UK' }, fotoThumbnail: '/placeholder.webp' },
    ]
  }

  return (
    <div className={styles.page}>
      <HeroHeader 
        backgroundImage="/open_trip_hero.webp"
        title={<>Kunjungi Tempat<br />Terindah Di Eropa<br />Bersama <span className={styles.textGold}>Agendain.</span></>}
        minHeight="70vh"
        paddingBottom="120px"
        textAlign="left"
      />
      
      <div className={styles.statsWrapper}>
        <div className={styles.statsContainer}>
          <div className={styles.statBox}>
            <h4>2+</h4>
            <p>Pengalaman</p>
          </div>
          <div className={styles.statBox}>
            <h4>63+</h4>
            <p>Destinasi Unik</p>
          </div>
          <div className={styles.statBox}>
            <h4>32K+</h4>
            <p>Traveler Senang</p>
          </div>
          <div className={styles.statBox}>
            <h4>94%</h4>
            <p>Tingkat Kepuasan</p>
          </div>
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.container}>
          
          <div className={styles.sectionHeader}>
            <p className={styles.sectionLabel}>Semua Jadwal Keberangkatan</p>
            <h2 className={styles.sectionTitle}>Eksplor Eropa Dengan Paket<br/>Tur Eksklusif Agendain!</h2>
          </div>

          <PaketFilter destList={destList} />
          
          <div className={styles.grid}>
            {packages.map(pkg => (
              <PackageCard key={pkg.id} {...pkg} />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.ctaBannerWrapper}>
        <div className={styles.ctaBanner}>
          <div className={styles.ctaContent}>
            <p className={styles.ctaLabel}>Mau Berangkat?</p>
            <h2>Booking Sekarang Mulai Dari <span className={styles.textGold}>500rb</span> Aja!</h2>
            <p>Gak perlu bingung, gak perlu ribet. Tim Agendain siap bantuin dari pemilihan paket, pengurusan visa, sampai kamu mendarat dengan selamat di Eropa.</p>
          </div>
          <div className={styles.ctaActions}>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              Chat WhatsApp Sekarang
            </a>
            <a href="#jadwal" className={styles.btnSecondary}>Lihat Jadwal Trip →</a>
          </div>
        </div>
      </div>

    </div>
  )
}
