import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function PaketDetail({ params }: { params: { slug: string } }) {
  const { slug } = await params
  
  let pkg = await prisma.paket.findUnique({
    where: { slug },
    include: { destinasi: true }
  })
  
  // Fallback to dummy data for development
  if (!pkg) {
    if (slug === 'romantic-paris-5d') {
      pkg = {
        id: 1, slug: 'romantic-paris-5d', nama: 'Romantic Paris 5 Days', 
        harga: 15000000 as any, durasi: 5, destinasiId: 1, 
        destinasi: { id: 1, nama: 'Prancis', slug: 'prancis', negara: 'Prancis', deskripsi: '', foto: '', bahasa: '', matauang: '', waktuTerbaik: '', infoVisa: '' },
        foto: { large: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1280&auto=format&fit=crop', gallery: [
          'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800',
          'https://images.unsplash.com/photo-1520939817895-060bdaf4ed1b?q=80&w=800',
          'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=800',
          'https://images.unsplash.com/photo-1431274172761-fca41d930114?q=80&w=800'
        ]},
        deskripsi: 'Jelajahi keindahan romantis Paris selama 5 hari bersama pasangan atau keluarga Anda. Kunjungi landmark ikonik dan nikmati kuliner khas.',
        itinerary: [
          { hari: 1, judul: 'Kedatangan di Paris', desc: 'Penjemputan di bandara Charles de Gaulle, check-in hotel, free program.' },
          { hari: 2, judul: 'Eiffel & Seine River', desc: 'Tour ke Menara Eiffel dan menyusuri sungai Seine dengan Bateaux Parisiens.' }
        ],
        fasilitas: ['Hotel bintang 4', 'Transportasi AC', 'Tour Guide Berbahasa Indonesia'],
        termasuk: ['Tiket pesawat', 'Hotel', 'Sarapan'],
        tidakTermasuk: ['Visa', 'Makan siang & malam', 'Pengeluaran pribadi'],
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      } as any
    } else {
      notFound()
    }
  }

  const fotos = pkg.foto as any || {}
  const mainImage = fotos.large || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1280&auto=format&fit=crop'
  const gallery = fotos.gallery || [mainImage, mainImage, mainImage, mainImage]

  const formattedHarga = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(Number(pkg.harga))

  const itinerary = (pkg.itinerary as any[]) || []
  const termasuk = (pkg.termasuk as string[]) || []
  const tidakTermasuk = (pkg.tidakTermasuk as string[]) || []

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/">Beranda</Link> <span className={styles.separator}>/</span>
          <Link href="/paket">Paket</Link> <span className={styles.separator}>/</span>
          <span className={styles.current}>{pkg.nama}</span>
        </div>

        {/* Title */}
        <h1 className={styles.title}>{pkg.nama}</h1>
        <div className={styles.meta}>
          <span className={styles.badge}>{pkg.destinasi.nama}</span>
          <span>{pkg.durasi} Hari</span>
        </div>

        {/* Photo Gallery (Airbnb style) */}
        <div className={styles.gallery}>
          <div className={styles.mainPhoto}>
            <Image src={mainImage} alt={pkg.nama} fill priority className={styles.img} />
          </div>
          <div className={styles.subPhotos}>
            {gallery.slice(0, 4).map((src: string, i: number) => (
              <div key={i} className={styles.photoWrap}>
                <Image src={src} alt={`Gallery ${i}`} fill className={styles.img} />
              </div>
            ))}
          </div>
        </div>

        {/* Content Layout */}
        <div className={styles.layout}>
          {/* Left Column */}
          <div className={styles.mainContent}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Deskripsi</h2>
              <p className={styles.descText}>{pkg.deskripsi}</p>
            </section>

            <div className={styles.divider} />

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Fasilitas</h2>
              <div className={styles.amenities}>
                {((pkg.fasilitas as string[]) || []).map((f, i) => (
                  <div key={i} className={styles.amenityItem}>
                    <span className={styles.check}>✓</span> {f}
                  </div>
                ))}
              </div>
            </section>

            <div className={styles.divider} />

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Termasuk / Tidak Termasuk</h2>
              <div className={styles.incExcGrid}>
                <div>
                  <h3 className={styles.subTitle}>Termasuk</h3>
                  <ul className={styles.list}>
                    {termasuk.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className={styles.subTitle}>Tidak Termasuk</h3>
                  <ul className={styles.listExc}>
                    {tidakTermasuk.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              </div>
            </section>

            <div className={styles.divider} />

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Itinerary</h2>
              <div className={styles.itinerary}>
                {itinerary.map((it, i) => (
                  <div key={i} className={styles.itDay}>
                    <div className={styles.dayLabel}>Hari {it.hari}</div>
                    <div className={styles.dayContent}>
                      <h4>{it.judul}</h4>
                      <p>{it.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column (Sticky Reservation Card) */}
          <div className={styles.sidebar}>
            <div className={styles.resCard}>
              <div className={styles.resPrice}>
                <span className={styles.priceAmount}>{formattedHarga}</span>
                <span className={styles.priceUnit}>/ pax</span>
              </div>
              
              <form className={styles.form}>
                <div className={styles.inputGroup}>
                  <label>Tanggal Keberangkatan</label>
                  <input type="date" className={styles.input} required />
                </div>
                <div className={styles.inputGroup}>
                  <label>Jumlah Peserta</label>
                  <input type="number" min="1" defaultValue="2" className={styles.input} required />
                </div>
                <button type="submit" className={styles.reserveBtn}>Pesan Sekarang</button>
              </form>
              
              <div className={styles.waOption}>
                <p>Atau konsultasi via WhatsApp</p>
                <a href={`https://wa.me/6281234567890?text=Halo%20Agendain,%20saya%20tertarik%20dengan%20paket%20${pkg.nama}`} 
                   target="_blank" rel="noreferrer" className={styles.waBtn}>
                  Chat WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
