import HomeContent from '@/components/HomeContent/HomeContent'
import { prisma } from '@/lib/prisma'

export const revalidate = 60;

// Dummy data fallback for development if DB is empty
const DUMMY_PACKAGES = [
  { id: 1, slug: 'romantic-paris-5d', nama: 'Romantic Paris 5 Days', harga: 15000000, durasi: 5, destinasi: { nama: 'Prancis' }, fotoThumbnail: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop', label: 'Terlaris' },
  { id: 2, slug: 'swiss-alps-7d', nama: 'Swiss Alps Adventure 7D', harga: 22000000, durasi: 7, destinasi: { nama: 'Swiss' }, fotoThumbnail: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800&auto=format&fit=crop', label: null },
  { id: 3, slug: 'classic-italy-8d', nama: 'Classic Italy 8 Days', harga: 18500000, durasi: 8, destinasi: { nama: 'Italia' }, fotoThumbnail: 'https://images.unsplash.com/photo-1516483638261-f40889c28a5d?q=80&w=800&auto=format&fit=crop', label: 'Populer' },
  { id: 4, slug: 'london-scotland-10d', nama: 'London & Scotland 10D', harga: 28000000, durasi: 10, destinasi: { nama: 'UK' }, fotoThumbnail: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop', label: null },
]

const DUMMY_DESTINATIONS = [
  { slug: 'prancis', nama: 'Prancis', foto: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop', paketCount: 12 },
  { slug: 'swiss', nama: 'Swiss', foto: 'https://images.unsplash.com/photo-1527668752968-14ce70a6a7ea?q=80&w=800&auto=format&fit=crop', paketCount: 8 },
  { slug: 'italia', nama: 'Italia', foto: 'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=800&auto=format&fit=crop', paketCount: 15 },
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
    heroTitle: 'Jelajahi Eropa Tanpa Beban',
    heroTitle_en: 'Explore Europe Burden-Free',
    heroTitleColor: '',
    heroSubtitle: 'Rencanakan perjalanan impian Anda bersama ahlinya. Transparan, terpercaya, dan berkesan.',
    heroSubtitle_en: 'Plan your dream journey with the experts. Transparent, trusted, and memorable.',
    heroSubtitleColor: '',
    featuresTitle: 'Kenapa Memilih Agendain?',
    featuresTitle_en: 'Why Choose Agendain?',
    featuresTitleColor: '',
    ctaTitle: 'Siap Memulai Perjalanan Anda?',
    ctaTitle_en: 'Ready to Start Your Journey?',
    ctaTitleColor: '',
    ctaText: 'Diskusikan rencana liburan impian Anda bersama tim kami secara gratis.',
    ctaText_en: 'Discuss your dream vacation plans with our team for free.',
    ctaTextColor: '',
    ctaBtn1Text: 'Rencanakan Private Trip',
    ctaBtn1Text_en: 'Plan Private Trip',
    ctaBtn1Link: '/private-trip',
    ctaBtn1Color: '',
    ctaBtn1HoverColor: '',
    ctaBtn1TextColor: '',
    ctaBtn2Text: 'Chat WhatsApp',
    ctaBtn2Text_en: 'Chat WhatsApp',
    ctaBtn2Link: 'https://wa.me/6281234567890',
    ctaBtn2Color: '',
    ctaBtn2HoverColor: '',
    ctaBtn2TextColor: '',
    sectionOrder: 'packages,destinations,features,cta',
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
