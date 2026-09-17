import HomeContent from '@/components/HomeContent/HomeContent'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import { pageMeta } from '@/lib/og'

export const revalidate = 60;

// og:image beranda = foto hero beranda (dari CMS `home_settings.heroBgImage`),
// jadi pratinjau share menampilkan hero yang sedang tayang. Canonical self-ref.
export async function generateMetadata(): Promise<Metadata> {
  let hero: string | undefined;
  try {
    const row = await prisma.setting.findUnique({ where: { key: "home_settings" } });
    if (row) hero = JSON.parse(row.value)?.heroBgImage;
  } catch {}
  return pageMeta({
    title: "Agendain | Travel Agency Indonesia ke Eropa",
    description:
      "Paket perjalanan terbaik dari Indonesia ke Eropa bersama Agendain. Open trip & private trip Eropa dengan guide berpengalaman.",
    path: "/",
    image: hero || "/hero-coastal.webp",
  });
}

// Dummy data fallback for development if DB is empty
const DUMMY_PACKAGES = [
  { id: 1, slug: 'romantic-paris-5d', nama: 'Romantic Paris 5 Days', harga: 15000000, durasi: 5, destinasi: { nama: 'Prancis' }, fotoThumbnail: '/placeholder.webp', label: 'Terlaris' },
  { id: 2, slug: 'swiss-alps-7d', nama: 'Swiss Alps Adventure 7D', harga: 22000000, durasi: 7, destinasi: { nama: 'Swiss' }, fotoThumbnail: '/placeholder.webp', label: null },
  { id: 3, slug: 'classic-italy-8d', nama: 'Classic Italy 8 Days', harga: 18500000, durasi: 8, destinasi: { nama: 'Italia' }, fotoThumbnail: '/placeholder.webp', label: 'Populer' },
  { id: 4, slug: 'london-scotland-10d', nama: 'London & Scotland 10D', harga: 28000000, durasi: 10, destinasi: { nama: 'UK' }, fotoThumbnail: '/placeholder.webp', label: null },
]

const DUMMY_DESTINATIONS = [
  { slug: 'prancis', nama: 'Prancis', foto: '/placeholder.webp', openTripCount: 12 },
  { slug: 'swiss', nama: 'Swiss', foto: '/placeholder.webp', openTripCount: 8 },
  { slug: 'italia', nama: 'Italia', foto: '/placeholder.webp', openTripCount: 15 },
]

import { Suspense } from 'react'
import AirplaneLoader from '@/components/ui/airplane-loader'

async function HomeDataFetcher() {
  // Try fetching from DB, fallback to dummy
  let packages: any[] = []
  let destinations: any[] = []
  
  try {
    const dbPackages = await prisma.openTrip.findMany({
      where: { status: { in: ['published', 'publish'] } },
      take: 4,
      include: { destinasi: true }
    })
    
    // Transform foto from JSON
    packages = dbPackages.map((p: any) => {
      const foto = p.foto as any;
      const firstFoto = Array.isArray(foto) ? foto[0] : foto;
      return {
        ...p,
        harga: Number(p.harga),
        fotoThumbnail: firstFoto?.thumb || firstFoto?.medium || (typeof firstFoto === 'string' ? firstFoto : DUMMY_PACKAGES[0].fotoThumbnail),
        label: p.label || null
      }
    })
    
    const dbDest = await prisma.destinasi.findMany({
      take: 3,
      include: { 
        openTrips: {
          select: { harga: true },
          where: { status: { in: ['published', 'publish'] } }
        } 
      }
    })
    
    destinations = dbDest.map((d: any) => {
      const minPrice = d.openTrips.length > 0 
        ? Math.min(...d.openTrips.map((ot: any) => Number(ot.harga))) 
        : null;
        
      const { openTrips, ...rest } = d;

      return {
        ...rest,
        openTripCount: d.openTrips.length,
        minPrice: minPrice,
        foto: d.foto || DUMMY_DESTINATIONS[0].foto
      }
    })
    
  } catch (error) {
    console.error('DB fetch failed, using dummy data', error)
  }
  
  if (packages.length === 0) packages = DUMMY_PACKAGES
  if (destinations.length === 0) destinations = DUMMY_DESTINATIONS

  let homeSettings: any = {
    heroTitle: 'Jangan Cuma Jadi Wacana, Agendain Aja!',
    heroSubtitle: 'Dari tiket, hotel, sampai itinerary, semua udah kami siapkan. Kamu tinggal ajak teman dan siap berangkat.',
    sectionOrder: 'hero,why,destinations,testimonial,accordion,socialproof,faq',
  }

  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'home_settings' } })
    if (setting) {
      const parsedSettings = JSON.parse(setting.value)
      // Fix for legacy database data
      if (parsedSettings.sectionOrder) {
        if (!parsedSettings.sectionOrder.includes('hero')) {
          parsedSettings.sectionOrder = 'hero,' + parsedSettings.sectionOrder
        }
        if (parsedSettings.sectionOrder.includes('packages')) {
          parsedSettings.sectionOrder = parsedSettings.sectionOrder.replace('packages,', '').replace(',packages', '').replace('packages', '')
        }
      }
      homeSettings = { ...homeSettings, ...parsedSettings }
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
