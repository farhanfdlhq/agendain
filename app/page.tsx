import HomeContent from '@/components/HomeContent/HomeContent'
import { prisma } from '@/lib/prisma'

export const revalidate = 60;

// Dummy data fallback for development if DB is empty
const DUMMY_PACKAGES = [
  { id: 1, slug: 'romantic-paris-5d', nama: 'Romantic Paris 5 Days', harga: 15000000, durasi: 5, destinasi: { nama: 'Prancis' }, fotoThumbnail: '/placeholder.png', label: 'Terlaris' },
  { id: 2, slug: 'swiss-alps-7d', nama: 'Swiss Alps Adventure 7D', harga: 22000000, durasi: 7, destinasi: { nama: 'Swiss' }, fotoThumbnail: '/placeholder.png', label: null },
  { id: 3, slug: 'classic-italy-8d', nama: 'Classic Italy 8 Days', harga: 18500000, durasi: 8, destinasi: { nama: 'Italia' }, fotoThumbnail: '/placeholder.png', label: 'Populer' },
  { id: 4, slug: 'london-scotland-10d', nama: 'London & Scotland 10D', harga: 28000000, durasi: 10, destinasi: { nama: 'UK' }, fotoThumbnail: '/placeholder.png', label: null },
]

const DUMMY_DESTINATIONS = [
  { slug: 'prancis', nama: 'Prancis', foto: '/placeholder.png', paketCount: 12 },
  { slug: 'swiss', nama: 'Swiss', foto: '/placeholder.png', paketCount: 8 },
  { slug: 'italia', nama: 'Italia', foto: '/placeholder.png', paketCount: 15 },
]

import { Suspense } from 'react'
import AirplaneLoader from '@/components/ui/airplane-loader'

async function HomeDataFetcher() {
  // Try fetching from DB, fallback to dummy
  let packages: any[] = []
  let destinations: any[] = []
  
  try {
    const dbPackages = await prisma.paket.findMany({
      where: { status: 'published' },
      take: 4,
      include: { destinasi: true }
    })
    
    // Transform foto from JSON
    packages = dbPackages.map((p: any) => {
      const foto = p.foto as any;
      return {
        ...p,
        harga: Number(p.harga),
        fotoThumbnail: foto?.thumb || foto?.medium || DUMMY_PACKAGES[0].fotoThumbnail,
        label: p.label || null
      }
    })
    
    const dbDest = await prisma.destinasi.findMany({
      take: 3,
      include: { _count: { select: { pakets: true } } }
    })
    
    destinations = dbDest.map((d: any) => ({
      ...d,
      paketCount: d._count.pakets,
      foto: d.foto || DUMMY_DESTINATIONS[0].foto
    }))
    
  } catch (error) {
    console.error('DB fetch failed, using dummy data', error)
  }
  
  if (packages.length === 0) packages = DUMMY_PACKAGES
  if (destinations.length === 0) destinations = DUMMY_DESTINATIONS

  let homeSettings: any = {
    heroTitle: 'Jangan Cuma Jadi Wacana, Agendain Aja!',
    heroSubtitle: 'Dari tiket, hotel, sampai itinerary, semua udah kami siapkan. Kamu tinggal ajak teman dan siap berangkat.',
    sectionOrder: 'why,destinations,testimonial,accordion,socialproof,faq',
  }

  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'home_settings' } })
    if (setting) {
      homeSettings = { ...homeSettings, ...JSON.parse(setting.value) }
    }
  } catch (error) {
    console.error('Failed to fetch home settings', error)
  }

  return (
    <HomeContent 
      packages={packages} 
      destinations={destinations} 
      homeSettings={homeSettings} 
    />
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <AirplaneLoader size={48} />
      </div>
    }>
      <HomeDataFetcher />
    </Suspense>
  )
}
