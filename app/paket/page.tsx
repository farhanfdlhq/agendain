import PackageCard from '@/components/PackageCard/PackageCard'
import PaketFilter from '@/components/PaketFilter/PaketFilter'
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
    destList = dbDest.map(d => d.nama)

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
        fotoThumbnail: foto?.thumb || foto?.medium || 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop'
      }
    })
  } catch (error) {
    console.error('DB fetch failed', error)
  }

  // Fallback for empty DB
  if (packages.length === 0) {
    packages = [
      { id: 1, slug: 'romantic-paris-5d', nama: 'Romantic Paris 5 Days', harga: 15000000, durasi: 5, destinasi: { nama: 'Prancis' }, fotoThumbnail: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop' },
      { id: 2, slug: 'swiss-alps-7d', nama: 'Swiss Alps Adventure 7D', harga: 22000000, durasi: 7, destinasi: { nama: 'Swiss' }, fotoThumbnail: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800&auto=format&fit=crop' },
      { id: 3, slug: 'classic-italy-8d', nama: 'Classic Italy 8 Days', harga: 18500000, durasi: 8, destinasi: { nama: 'Italia' }, fotoThumbnail: 'https://images.unsplash.com/photo-1516483638261-f40889c28a5d?q=80&w=800&auto=format&fit=crop' },
      { id: 4, slug: 'london-scotland-10d', nama: 'London & Scotland 10D', harga: 28000000, durasi: 10, destinasi: { nama: 'UK' }, fotoThumbnail: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop' },
    ]
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.container}>
          <h1 className={styles.title}>Temukan Paket Impian Anda</h1>
          <p className={styles.subtitle}>Pilih dari berbagai destinasi menakjubkan di Eropa.</p>
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.container}>
          <PaketFilter destList={destList} />
          
          <div className={styles.grid}>
            {packages.map(pkg => (
              <PackageCard key={pkg.id} {...pkg} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
