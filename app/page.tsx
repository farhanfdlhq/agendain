import Hero from '@/components/Hero/Hero'
import PackageCard from '@/components/PackageCard/PackageCard'
import DestinationCard from '@/components/DestinationCard/DestinationCard'
import Link from 'next/link'
import styles from './page.module.css'
import { prisma } from '@/lib/prisma'
import { Map, Gem, Users, Sparkles } from 'lucide-react'
import FadeIn from '@/components/Motion/FadeIn'
import Stagger from '@/components/Motion/Stagger'

// Dummy data fallback for development if DB is empty
const DUMMY_PACKAGES = [
  { id: 1, slug: 'romantic-paris-5d', nama: 'Romantic Paris 5 Days', harga: 15000000, durasi: 5, destinasi: { nama: 'Prancis' }, fotoThumbnail: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop' },
  { id: 2, slug: 'swiss-alps-7d', nama: 'Swiss Alps Adventure 7D', harga: 22000000, durasi: 7, destinasi: { nama: 'Swiss' }, fotoThumbnail: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800&auto=format&fit=crop' },
  { id: 3, slug: 'classic-italy-8d', nama: 'Classic Italy 8 Days', harga: 18500000, durasi: 8, destinasi: { nama: 'Italia' }, fotoThumbnail: 'https://images.unsplash.com/photo-1516483638261-f40889c28a5d?q=80&w=800&auto=format&fit=crop' },
  { id: 4, slug: 'london-scotland-10d', nama: 'London & Scotland 10D', harga: 28000000, durasi: 10, destinasi: { nama: 'UK' }, fotoThumbnail: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop' },
]

const DUMMY_DESTINATIONS = [
  { slug: 'prancis', nama: 'Prancis', foto: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop', paketCount: 12 },
  { slug: 'swiss', nama: 'Swiss', foto: 'https://images.unsplash.com/photo-1527668752968-14ce70a6a7ea?q=80&w=800&auto=format&fit=crop', paketCount: 8 },
  { slug: 'italia', nama: 'Italia', foto: 'https://images.unsplash.com/photo-1471306224500-6d0d218be372?q=80&w=800&auto=format&fit=crop', paketCount: 15 },
]

export default async function Home() {
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
        fotoThumbnail: foto?.thumb || foto?.medium || DUMMY_PACKAGES[0].fotoThumbnail
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

  return (
    <>
      <Hero />
      
      <section className={styles.section}>
        <div className={styles.container}>
          <FadeIn direction="up">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Paket Unggulan</h2>
              <Link href="/paket" className={styles.viewAll}>Lihat Semua Paket →</Link>
            </div>
          </FadeIn>
          
          <Stagger className={styles.packageGrid}>
            {packages.map((pkg) => (
              <PackageCard key={pkg.slug} {...pkg} />
            ))}
          </Stagger>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <FadeIn direction="up">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Destinasi Favorit</h2>
              <Link href="/destinasi" className={styles.viewAll}>Jelajahi Eropa →</Link>
            </div>
          </FadeIn>
          
          <Stagger className={styles.destinationGrid}>
            {destinations.map((dest) => (
              <DestinationCard key={dest.slug} {...dest} />
            ))}
          </Stagger>
        </div>
      </section>
      
      <section className={styles.features}>
        <div className={styles.container}>
          <FadeIn direction="up">
            <h2 className={styles.featuresTitle}>Kenapa Memilih Agendain?</h2>
          </FadeIn>
          <Stagger className={styles.featuresGrid}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <Map size={32} strokeWidth={1.5} color="currentColor" />
              </div>
              <div className={styles.featureText}>
                <h3>Spesialis Eropa</h3>
                <p>Fokus penuh pada destinasi Italia & Eropa dengan partner lokal terpercaya.</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <Gem size={32} strokeWidth={1.5} color="currentColor" />
              </div>
              <div className={styles.featureText}>
                <h3>Harga Transparan</h3>
                <p>Tanpa biaya tersembunyi. Apa yang Anda lihat adalah apa yang Anda bayar.</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <Users size={32} strokeWidth={1.5} color="currentColor" />
              </div>
              <div className={styles.featureText}>
                <h3>Guide Profesional</h3>
                <p>Didampingi oleh Tour Leader berlisensi yang memahami budaya lokal.</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <Sparkles size={32} strokeWidth={1.5} color="currentColor" />
              </div>
              <div className={styles.featureText}>
                <h3>Itinerary Fleksibel</h3>
                <p>Tersedia layanan Private Trip untuk pengalaman liburan yang lebih personal.</p>
              </div>
            </div>
          </Stagger>
        </div>
      </section>
      
      <section className={styles.ctaBand}>
        <div className={styles.container}>
          <FadeIn direction="up" className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Siap Memulai Perjalanan Anda?</h2>
            <p className={styles.ctaText}>Diskusikan rencana liburan impian Anda bersama tim kami secara gratis.</p>
            <div className={styles.ctaButtons}>
              <Link href="/private-trip" className={styles.btnPrimary}>Rencanakan Private Trip</Link>
              <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className={styles.btnSecondary}>
                Chat WhatsApp
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
