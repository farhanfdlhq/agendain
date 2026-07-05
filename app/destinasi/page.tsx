import DestinationCard from '@/components/DestinationCard/DestinationCard'
import { prisma } from '@/lib/prisma'
import styles from './page.module.css'
import DestinasiHeader from './DestinasiHeader'

export default async function DestinasiPage() {
  let destinations: any[] = []
  
  try {
    const dbDest = await prisma.destinasi.findMany({
      include: { _count: { select: { pakets: true } } },
      orderBy: { nama: 'asc' }
    })
    
    destinations = dbDest.map(d => ({
      ...d,
      paketCount: d._count.pakets,
      foto: d.foto || '/placeholder.png'
    }))
  } catch (error) {
    console.error('DB fetch failed', error)
  }

  if (destinations.length === 0) {
    destinations = [
      { slug: 'prancis', nama: 'Prancis', foto: '/placeholder.png', paketCount: 12 },
      { slug: 'swiss', nama: 'Swiss', foto: '/placeholder.png', paketCount: 8 },
      { slug: 'italia', nama: 'Italia', foto: '/placeholder.png', paketCount: 15 },
      { slug: 'inggris', nama: 'Inggris', foto: '/placeholder.png', paketCount: 5 },
      { slug: 'belanda', nama: 'Belanda', foto: '/placeholder.png', paketCount: 7 },
    ]
  }

  return (
    <div className={styles.page}>
      <DestinasiHeader />
      
      <div className={styles.content}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {destinations.map(dest => (
              <DestinationCard key={dest.slug} {...dest} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
