import PackageCard from '@/components/PackageCard/PackageCard'
import PaketFilter from '@/components/PaketFilter/PaketFilter'
import styles from './page.module.css'
import { prisma } from '@/lib/prisma'
import PaketHeader from './PaketHeader'

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
        fotoThumbnail: foto?.thumb || foto?.medium || '/placeholder.png'
      }
    })
  } catch (error) {
    console.error('DB fetch failed', error)
  }

  // Fallback for empty DB
  if (packages.length === 0) {
    packages = [
      { id: 1, slug: 'romantic-paris-5d', nama: 'Romantic Paris 5 Days', harga: 15000000, durasi: 5, destinasi: { nama: 'Prancis' }, fotoThumbnail: '/placeholder.png' },
      { id: 2, slug: 'swiss-alps-7d', nama: 'Swiss Alps Adventure 7D', harga: 22000000, durasi: 7, destinasi: { nama: 'Swiss' }, fotoThumbnail: '/placeholder.png' },
      { id: 3, slug: 'classic-italy-8d', nama: 'Classic Italy 8 Days', harga: 18500000, durasi: 8, destinasi: { nama: 'Italia' }, fotoThumbnail: '/placeholder.png' },
      { id: 4, slug: 'london-scotland-10d', nama: 'London & Scotland 10D', harga: 28000000, durasi: 10, destinasi: { nama: 'UK' }, fotoThumbnail: '/placeholder.png' },
    ]
  }

  return (
    <div className={styles.page}>
      <PaketHeader />
      
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
