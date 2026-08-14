import styles from './page.module.css'
import { prisma } from '@/lib/prisma'
import OpenTripContent from './OpenTripContent'

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
  const where: any = { status: { in: ['published', 'publish'] } }
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
  let opentripSettings: any = {}
  
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'opentrip_settings' } })
    if (setting) {
      opentripSettings = JSON.parse(setting.value)
    }

    const dbDest = await prisma.destinasi.findMany({ select: { nama: true } })
    destList = dbDest.map((d: { nama: string }) => d.nama)

    const dbPackages = await prisma.openTrip.findMany({
      where,
      include: { destinasi: true },
      orderBy

    })
    
    packages = dbPackages.map((p: any) => {
      const foto = p.foto as any;
      const firstFoto = Array.isArray(foto) ? foto[0] : foto;
      return {
        ...p,
        harga: Number(p.harga),
        fotoThumbnail: firstFoto?.thumb || firstFoto?.medium || (typeof firstFoto === 'string' ? firstFoto : '/placeholder.webp')
      }
    })
  } catch (error) {
    console.error('DB fetch failed', error)
  }

  // Fallback for empty DB
  if (packages.length === 0) {
    packages = [
      { id: 1, slug: 'romantic-paris-5d', nama: 'Romantic Paris 5 Days', harga: 15000000, durasi: 5, destinasi: { nama: 'Prancis' }, fotoThumbnail: '/placeholder.webp', label: 'Terlaris' },
      { id: 2, slug: 'swiss-alps-7d', nama: 'Swiss Alps Adventure 7D', harga: 22000000, durasi: 7, destinasi: { nama: 'Swiss' }, fotoThumbnail: '/placeholder.webp', label: null },
      { id: 3, slug: 'classic-italy-8d', nama: 'Classic Italy 8 Days', harga: 18500000, durasi: 8, destinasi: { nama: 'Italia' }, fotoThumbnail: '/placeholder.webp', label: 'Populer' },
      { id: 4, slug: 'london-scotland-10d', nama: 'London & Scotland 10D', harga: 28000000, durasi: 10, destinasi: { nama: 'UK' }, fotoThumbnail: '/placeholder.webp', label: null },
    ]
  }

  return <OpenTripContent packages={packages} destList={destList} opentripSettings={opentripSettings} />
}
