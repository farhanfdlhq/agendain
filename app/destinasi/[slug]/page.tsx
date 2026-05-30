import Image from 'next/image'
import Link from 'next/link'
import PackageCard from '@/components/PackageCard/PackageCard'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import styles from './page.module.css'

export default async function DestinasiDetail(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  
  let destinasi = await prisma.destinasi.findUnique({
    where: { slug },
    include: { pakets: { where: { status: 'published' } } }
  })
  
  if (!destinasi) {
    const dummyDest: Record<string, any> = {
      'prancis': {
        id: 1, slug: 'prancis', nama: 'Prancis', negara: 'Prancis',
        foto: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1280&auto=format&fit=crop',
        deskripsi: 'Prancis adalah pusat seni, arsitektur, dan kuliner dunia.',
        bahasa: 'Prancis', matauang: 'Euro (EUR)', waktuTerbaik: 'Mei - September', infoVisa: 'Schengen Visa required.',
        pakets: [{ id: 1, slug: 'romantic-paris-5d', nama: 'Romantic Paris 5 Days', harga: 15000000, durasi: 5, fotoThumbnail: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800' }]
      },
      'swiss': {
        id: 2, slug: 'swiss', nama: 'Swiss', negara: 'Swiss',
        foto: 'https://images.unsplash.com/photo-1527668752968-14ce70a6a7ea?q=80&w=1280&auto=format&fit=crop',
        deskripsi: 'Swiss menawarkan keindahan pegunungan Alpen, danau sebening kristal, dan cokelat terbaik.',
        bahasa: 'Jerman, Prancis, Italia', matauang: 'Swiss Franc (CHF)', waktuTerbaik: 'Desember - Maret (Winter)', infoVisa: 'Schengen Visa required.',
        pakets: [{ id: 2, slug: 'swiss-alps-7d', nama: 'Swiss Alps Adventure 7D', harga: 22000000, durasi: 7, fotoThumbnail: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800' }]
      },
      'italia': {
        id: 3, slug: 'italia', nama: 'Italia', negara: 'Italia',
        foto: 'https://images.unsplash.com/photo-1471306224500-6d0d218be372?q=80&w=1280&auto=format&fit=crop',
        deskripsi: 'Italia memanjakan Anda dengan sejarah Kekaisaran Romawi, karya seni Renaissance, dan pizza.',
        bahasa: 'Italia', matauang: 'Euro (EUR)', waktuTerbaik: 'April - Juni', infoVisa: 'Schengen Visa required.',
        pakets: [{ id: 3, slug: 'classic-italy-8d', nama: 'Classic Italy 8 Days', harga: 18500000, durasi: 8, fotoThumbnail: 'https://images.unsplash.com/photo-1516483638261-f40889c28a5d?q=80&w=800' }]
      }
    }

    if (dummyDest[slug]) {
      destinasi = dummyDest[slug]
    } else {
      notFound()
    }
  }

  const fotoUtama = destinasi?.foto || 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1280&auto=format&fit=crop'
  const packages = destinasi?.pakets?.map((p: any) => ({
    ...p,
    harga: Number(p.harga),
    destinasi: { nama: destinasi!.nama },
    fotoThumbnail: (p.foto as any)?.thumb || (p.foto as any)?.medium || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800'
  })) || []

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <Image src={fotoUtama} alt={destinasi?.nama || 'Destinasi'} fill priority className={styles.heroImage} />
        <div className={styles.overlay} />
        <div className={styles.heroContent}>
          <div className={styles.breadcrumb}>
            <Link href="/">Beranda</Link> <span className={styles.separator}>/</span>
            <Link href="/destinasi">Destinasi</Link> <span className={styles.separator}>/</span>
            <span className={styles.current}>{destinasi?.nama}</span>
          </div>
          <h1 className={styles.title}>{destinasi?.nama}</h1>
        </div>
      </div>
      
      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.mainContent}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Tentang {destinasi?.nama}</h2>
              <p className={styles.desc}>{destinasi?.deskripsi}</p>
            </section>
            
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Paket Tersedia di {destinasi?.nama}</h2>
              {packages.length > 0 ? (
                <div className={styles.grid}>
                  {packages.map(pkg => (
                    <PackageCard key={pkg.slug} {...pkg} />
                  ))}
                </div>
              ) : (
                <p className={styles.empty}>Belum ada paket wisata untuk destinasi ini.</p>
              )}
            </section>
          </div>
          
          <div className={styles.sidebar}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Informasi Penting</h3>
              <ul className={styles.infoList}>
                {destinasi?.bahasa && (
                  <li>
                    <span className={styles.infoLabel}>Bahasa</span>
                    <span className={styles.infoValue}>{destinasi.bahasa}</span>
                  </li>
                )}
                {destinasi?.matauang && (
                  <li>
                    <span className={styles.infoLabel}>Mata Uang</span>
                    <span className={styles.infoValue}>{destinasi.matauang}</span>
                  </li>
                )}
                {destinasi?.waktuTerbaik && (
                  <li>
                    <span className={styles.infoLabel}>Waktu Terbaik</span>
                    <span className={styles.infoValue}>{destinasi.waktuTerbaik}</span>
                  </li>
                )}
                {destinasi?.infoVisa && (
                  <li className={styles.visaInfo}>
                    <span className={styles.infoLabel}>Info Visa</span>
                    <span className={styles.infoValue}>{destinasi.infoVisa}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
