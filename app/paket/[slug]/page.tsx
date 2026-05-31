import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function PaketDetail(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  
  let pkg = await prisma.paket.findUnique({
    where: { slug },
    include: { destinasi: true }
  })
  
  let settingsObj: any = {}
  try {
    const settingsArr: any[] = await prisma.$queryRaw`SELECT * FROM Setting`
    settingsObj = settingsArr.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {})
  } catch (e) {}
  
  // Fallback to dummy data for development
  if (!pkg) {
    const dummyData: Record<string, any> = {
      'romantic-paris-5d': {
        id: 1, slug: 'romantic-paris-5d', nama: 'Romantic Paris 5 Days', 
        harga: 15000000 as any, durasi: 5, destinasiId: 1, 
        destinasi: { id: 1, nama: 'Prancis', slug: 'prancis' },
        foto: { large: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1280&auto=format&fit=crop' },
        deskripsi: 'Jelajahi keindahan romantis Paris selama 5 hari bersama pasangan atau keluarga Anda. Kunjungi landmark ikonik dan nikmati kuliner khas.',
        itinerary: [
          { hari: 1, judul: 'Kedatangan di Paris', desc: 'Penjemputan di bandara Charles de Gaulle, check-in hotel, free program.' },
          { hari: 2, judul: 'Eiffel & Seine River', desc: 'Tour ke Menara Eiffel dan menyusuri sungai Seine dengan Bateaux Parisiens.' }
        ],
        fasilitas: ['Hotel bintang 4', 'Transportasi AC', 'Tour Guide Berbahasa Indonesia'],
        termasuk: ['Tiket pesawat', 'Hotel', 'Sarapan'],
        tidakTermasuk: ['Visa', 'Makan siang & malam', 'Pengeluaran pribadi'],
        status: 'published'
      },
      'swiss-alps-7d': {
        id: 2, slug: 'swiss-alps-7d', nama: 'Swiss Alps Adventure 7D', 
        harga: 22000000 as any, durasi: 7, destinasiId: 2, 
        destinasi: { id: 2, nama: 'Swiss', slug: 'swiss' },
        foto: { large: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1280&auto=format&fit=crop' },
        deskripsi: 'Jelajahi pegunungan Alpen Swiss yang megah. Naik kereta Glacier Express dan nikmati pemandangan bersalju abadi.',
        itinerary: [{ hari: 1, judul: 'Zurich Arrival', desc: 'Tiba di Zurich.' }],
        fasilitas: ['Hotel 4 Star', 'Swiss Travel Pass'],
        termasuk: ['Hotel', 'Train Tickets'],
        tidakTermasuk: ['Visa', 'Meals'],
        status: 'published'
      },
      'classic-italy-8d': {
        id: 3, slug: 'classic-italy-8d', nama: 'Classic Italy 8 Days', 
        harga: 18500000 as any, durasi: 8, destinasiId: 3, 
        destinasi: { id: 3, nama: 'Italia', slug: 'italia' },
        foto: { large: 'https://images.unsplash.com/photo-1516483638261-f40889c28a5d?q=80&w=1280&auto=format&fit=crop' },
        deskripsi: 'Menjelajahi Roma, Florence, dan Venice dalam 8 hari penuh keajaiban sejarah dan kuliner.',
        itinerary: [{ hari: 1, judul: 'Rome Arrival', desc: 'Tiba di Roma.' }],
        fasilitas: ['Hotel 4 Star', 'Tour Guide'],
        termasuk: ['Hotel', 'Transport'],
        tidakTermasuk: ['Visa', 'Meals'],
        status: 'published'
      },
      'london-scotland-10d': {
        id: 4, slug: 'london-scotland-10d', nama: 'London & Scotland 10D', 
        harga: 28000000 as any, durasi: 10, destinasiId: 4, 
        destinasi: { id: 4, nama: 'UK', slug: 'uk' },
        foto: { large: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1280&auto=format&fit=crop' },
        deskripsi: 'Eksplorasi budaya Inggris dan keindahan alam Skotlandia yang magis selama 10 hari.',
        itinerary: [{ hari: 1, judul: 'London Arrival', desc: 'Tiba di London.' }],
        fasilitas: ['Hotel 4 Star', 'Transport'],
        termasuk: ['Hotel', 'Flight'],
        tidakTermasuk: ['Visa', 'Meals'],
        status: 'published'
      }
    }

    if (dummyData[slug]) {
      pkg = dummyData[slug]
    } else {
      notFound()
    }
  }

  const fotos = pkg?.foto as any || {}
  const mainImage = fotos.large || fotos.medium || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1280&auto=format&fit=crop'
  const gallery = fotos.gallery || [mainImage, mainImage, mainImage, mainImage]

  const { formatIDR, formatUSD, formatEUR, fetchExchangeRates } = await import('@/lib/currency')
  const rates = await fetchExchangeRates()
  const hargaIDRNum = Number(pkg?.harga || 0)
  const formattedHarga = formatIDR(hargaIDRNum)
  const formattedUSD = formatUSD(hargaIDRNum * (rates.USD || 0.000063))
  const formattedEUR = formatEUR(hargaIDRNum * (rates.EUR || 0.000058))

  const itinerary = (pkg?.itinerary as any[]) || []
  const termasuk = (pkg?.termasuk as string[]) || []
  const tidakTermasuk = (pkg?.tidakTermasuk as string[]) || []

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/">Beranda</Link> <span className={styles.separator}>/</span>
          <Link href="/paket">Paket</Link> <span className={styles.separator}>/</span>
          <span className={styles.current}>{pkg?.nama}</span>
        </div>

        {/* Title */}
        <h1 className={styles.title}>{pkg?.nama}</h1>
        <div className={styles.meta}>
          <span className={styles.badge}>{pkg?.destinasi?.nama}</span>
          <span>{pkg?.durasi} Hari</span>
        </div>

        {/* Photo Gallery (Airbnb style) */}
        <div className={styles.gallery}>
          <div className={styles.mainPhoto}>
            <Image src={mainImage} alt={pkg?.nama || 'Package'} fill priority className={styles.img} />
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
              <p className={styles.descText}>{pkg?.deskripsi}</p>
            </section>

            <div className={styles.divider} />

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Fasilitas</h2>
              <div className={styles.amenities}>
                {((pkg?.fasilitas as string[]) || []).map((f, i) => (
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
                      <p>{it.deskripsi || it.desc}</p>
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
              <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '16px', display: 'flex', gap: '8px' }}>
                <span>≈ {formattedUSD}</span> • <span>{formattedEUR}</span>
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
                <a href={`https://wa.me/${settingsObj.whatsapp_number?.replace(/\D/g, '') || "6281234567890"}?text=Halo%20Agendain,%20saya%20tertarik%20dengan%20paket%20${encodeURIComponent(pkg?.nama || '')}`} 
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
