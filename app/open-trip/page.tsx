import styles from './page.module.css'
import { prisma } from '@/lib/prisma'
import OpenTripContent from './OpenTripContent'
import { pageMeta } from '@/lib/og'
import { PUBLISHED_OPEN_TRIP, toOpenTripCard } from '@/lib/open-trip-card'
import { JsonLd, breadcrumbLd } from '@/lib/jsonld'

// Canonical menunjuk /open-trip TANPA query param: halaman ini memakai filter
// via searchParams (?destinasi=…&durasi=…) yang menghasilkan banyak URL berisi
// konten sama → sumber "Duplikat" di Search Console. Self-canonical ke versi
// bersih mengonsolidasikannya jadi satu. og:image = foto hero open trip.
export const metadata = pageMeta({
  title: 'Open Trip Eropa dari Indonesia | Agendain',
  description:
    'Open trip ke Eropa dengan jadwal keberangkatan tetap, didampingi tour leader orang Indonesia. Pilih destinasi dan durasi yang cocok untukmu.',
  path: '/open-trip',
  image: '/open_trip_hero.webp',
})

export default async function PaketPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const destinasiFilter = params?.destinasi as string
  const durasiFilter = params?.durasi as string
  const urutkanFilter = params?.urutkan as string
  
  // Build query
  const where: any = { ...PUBLISHED_OPEN_TRIP }
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
  let destList: { nama: string; namaEn?: string | null }[] = []
  let opentripSettings: any = {}

  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'opentrip_settings' } })
    if (setting) {
      opentripSettings = JSON.parse(setting.value)
    }

    // `namaEn` hanya untuk label dropdown; nilai filternya tetap nama Indonesia
    // karena query `where.destinasi.nama` mencocokkan kolom Indonesia.
    const dbDest = await prisma.destinasi.findMany({ select: { nama: true, namaEn: true } })
    destList = dbDest.map((d: { nama: string; namaEn: string | null }) => ({ nama: d.nama, namaEn: d.namaEn }))

    const dbPackages = await prisma.openTrip.findMany({
      where,
      include: { destinasi: true },
      orderBy

    })
    
    packages = dbPackages.map(toOpenTripCard)
  } catch (error) {
    console.error('DB fetch failed', error)
  }

  // Urutan tidak menyaring hasil, jadi hanya destinasi/durasi yang dihitung "filter aktif".
  const isFiltered = Boolean(destinasiFilter || durasiFilter)

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Beranda', path: '/' },
          { name: 'Open Trip', path: '/open-trip' },
        ])}
      />
      <OpenTripContent packages={packages} destList={destList} opentripSettings={opentripSettings} isFiltered={isFiltered} />
    </>
  )
}
