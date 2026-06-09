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
      foto: d.foto || 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop'
    }))
  } catch (error) {
    console.error('DB fetch failed', error)
  }

  if (destinations.length === 0) {
    destinations = [
      { slug: 'prancis', nama: 'Prancis', foto: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop', paketCount: 12 },
      { slug: 'swiss', nama: 'Swiss', foto: 'https://images.unsplash.com/photo-1527668752968-14ce70a6a7ea?q=80&w=800&auto=format&fit=crop', paketCount: 8 },
      { slug: 'italia', nama: 'Italia', foto: 'https://images.unsplash.com/photo-1471306224500-6d0d218be372?q=80&w=800&auto=format&fit=crop', paketCount: 15 },
      { slug: 'inggris', nama: 'Inggris', foto: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop', paketCount: 5 },
      { slug: 'belanda', nama: 'Belanda', foto: 'https://images.unsplash.com/photo-1468818463294-87a41d5e6383?q=80&w=800&auto=format&fit=crop', paketCount: 7 },
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
