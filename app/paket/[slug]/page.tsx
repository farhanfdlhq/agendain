import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import BookingForm from '@/components/BookingForm/BookingForm'
import GalleryLightbox from '@/components/GalleryLightbox/GalleryLightbox'
import { Clock, MapPin, Tag, CalendarClock, Info, AlertCircle, CheckCircle2, FileText, Car } from 'lucide-react'
import { formatIDR, formatUSD, formatEUR, fetchExchangeRates } from '@/lib/currency'

export const revalidate = 3600 // Cache for 1 hour

export default async function PaketDetail(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  
  const [pkg, settingsArr, rates] = await Promise.all([
    prisma.paket.findUnique({
      where: { slug },
      include: { destinasi: true }
    }),
    prisma.$queryRaw`SELECT * FROM Setting`.catch(() => [] as any[]),
    fetchExchangeRates().catch(() => ({ USD: 0.000063, EUR: 0.000058 }))
  ])
  
  let settingsObj = (settingsArr as any[]).reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {})
  
  if (!pkg) {
    notFound()
  }

  // Parse custom info/policy or fallback to global settings
  let finalInfoPenting = []
  if (Array.isArray(pkg.informasiPenting) && pkg.informasiPenting.length > 0) {
    finalInfoPenting = pkg.informasiPenting
  } else if (settingsObj.global_informasi_penting) {
    finalInfoPenting = settingsObj.global_informasi_penting.split('\n').filter((s: string) => s.trim())
  } else {
    finalInfoPenting = [
      "Paspor minimal masa berlaku 6 bulan dari tanggal kepulangan.",
      "Visa Schengen diwajibkan bagi pemegang paspor Indonesia.",
      "Jadwal perjalanan dan akomodasi dapat berubah sewaktu-waktu menyesuaikan kondisi cuaca."
    ]
  }

  let finalKebijakan = []
  if (Array.isArray(pkg.kebijakanPembatalan) && pkg.kebijakanPembatalan.length > 0) {
    finalKebijakan = pkg.kebijakanPembatalan
  } else if (settingsObj.global_kebijakan_pembatalan) {
    finalKebijakan = settingsObj.global_kebijakan_pembatalan.split('\n').filter((s: string) => s.trim())
  } else {
    finalKebijakan = [
      "Pembatalan > 30 hari sebelum keberangkatan: Pengembalian 50% dari total.",
      "Pembatalan 15-30 hari sebelum keberangkatan: Pengembalian 25% dari total.",
      "Pembatalan < 14 hari sebelum keberangkatan: Tidak ada pengembalian dana (Non-refundable).",
      "Jika visa ditolak, biaya visa tidak dapat dikembalikan."
    ]
  }

  let finalFileDokumen: any[] = []
  if (Array.isArray(pkg.fileDokumen) && pkg.fileDokumen.length > 0) {
    finalFileDokumen = pkg.fileDokumen
  }

  let finalOpsiPenjemputan = []
  if (Array.isArray(pkg.opsiPenjemputan) && pkg.opsiPenjemputan.length > 0) {
    finalOpsiPenjemputan = pkg.opsiPenjemputan
  } else if (settingsObj.global_opsi_penjemputan) {
    finalOpsiPenjemputan = settingsObj.global_opsi_penjemputan.split('\n').filter((s: string) => s.trim())
  } else {
    finalOpsiPenjemputan = [
      "Bandara Internasional Soekarno Hatta (Terminal 3).",
      "Penjemputan area Jakarta (sesuai konfirmasi).",
      "Silakan kumpul 4 jam sebelum keberangkatan."
    ]
  }

  const fotos = pkg?.foto as any || {}
  const mainImage = (fotos.large || fotos.medium) ? (fotos.large || fotos.medium) : '/placeholder.webp'
  
  let gallery = []
  if (Array.isArray(pkg?.foto) && pkg.foto.length > 0) {
    gallery = pkg.foto
  } else if (fotos.gallery && fotos.gallery.length > 0) {
    gallery = fotos.gallery
  } else {
    gallery = [mainImage, mainImage, mainImage, mainImage, mainImage]
  }


  const hargaIDRNum = Number(pkg?.harga || 0)
  const formattedHarga = formatIDR(hargaIDRNum)
  const formattedUSD = formatUSD(hargaIDRNum * (rates.USD || 0.000063))
  const formattedEUR = formatEUR(hargaIDRNum * (rates.EUR || 0.000058))

  const itinerary = (pkg?.itinerary as any[]) || []
  const fasilitas = (pkg?.fasilitas as string[]) || []
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
        
        {/* Photo Gallery with Lightbox */}
        <GalleryLightbox images={gallery} title={pkg.nama} />

        {/* Quick Info Cards */}
        <div className={styles.quickInfoGrid}>
          <div className={styles.quickInfoCard}>
            <Clock className={styles.quickIcon} />
            <div className={styles.quickText}>
              <span className={styles.quickLabel}>Durasi</span>
              <span className={styles.quickValue}>{pkg.durasi} Hari</span>
            </div>
          </div>
          <div className={styles.quickInfoCard}>
            <MapPin className={styles.quickIcon} />
            <div className={styles.quickText}>
              <span className={styles.quickLabel}>Destinasi</span>
              <span className={styles.quickValue}>{pkg.destinasi?.nama}</span>
            </div>
          </div>
          <div className={styles.quickInfoCard}>
            <Tag className={styles.quickIcon} />
            <div className={styles.quickText}>
              <span className={styles.quickLabel}>Kategori</span>
              <span className={styles.quickValue}>{pkg.label || 'Open Trip'}</span>
            </div>
          </div>
          <div className={styles.quickInfoCard}>
            <CalendarClock className={styles.quickIcon} />
            <div className={styles.quickText}>
              <span className={styles.quickLabel}>Keberangkatan</span>
              <span className={styles.quickValue}>Fleksibel / Sesuai Jadwal</span>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className={styles.layout}>
          {/* Left Column */}
          <div className={styles.mainContent}>
            
            {/* Deskripsi */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Ringkasan</h2>
              <p className={styles.descText}>{pkg?.deskripsi}</p>
            </section>

            <div className={styles.divider} />

            {/* Highlights */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Highlight Perjalanan</h2>
              <div className={styles.highlights}>
                {fasilitas.map((f, i) => (
                  <div key={i} className={styles.highlightItem}>
                    <CheckCircle2 className={styles.highlightIcon} size={20} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </section>

            <div className={styles.divider} />

            {/* Termasuk / Tidak Termasuk */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Termasuk & Tidak Termasuk</h2>
              <div className={styles.incExcGrid}>
                <div className={styles.incBox}>
                  <h3 className={styles.subTitle}>Termasuk</h3>
                  <ul className={styles.list}>
                    {termasuk.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
                <div className={styles.excBox}>
                  <h3 className={styles.subTitle}>Tidak Termasuk</h3>
                  <ul className={styles.listExc}>
                    {tidakTermasuk.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              </div>
            </section>

            <div className={styles.divider} />

            {/* Itinerary */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Itinerary</h2>
              <div className={styles.itineraryContainer}>
                {itinerary.map((it, i) => {
                  // Mencegah judul dobel jika user mengetik "Hari 1" di field judul
                  const rawJudul = it.judul || ''
                  const regex = new RegExp(`^Hari\\s*${it.hari}\\s*[-:–]*\\s*`, 'i')
                  let cleanJudul = rawJudul.replace(regex, '').trim()
                  // Jika judul aslinya cuma "Hari 1", cleanJudul jadi kosong
                  if (cleanJudul.toLowerCase() === `hari ${it.hari}`) {
                    cleanJudul = ''
                  }

                  return (
                    <div key={i} className={styles.itDay}>
                      <div className={styles.dayDot}></div>
                      <div className={styles.dayContent}>
                        <h4>
                          <span className={styles.dayLabel}>Hari {it.hari}</span>
                          {cleanJudul && <span className={styles.daySeparator}> – </span>}
                          {cleanJudul}
                        </h4>
                        <p>{it.deskripsi || it.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <div className={styles.divider} />

            {finalFileDokumen.length > 0 && (
              <div className={styles.plainSection}>
                <h3 className={styles.plainSectionTitle}>File & Dokumen</h3>
                <div className={styles.docBadgeList}>
                  {finalFileDokumen.map((doc: any, idx: number) => {
                    if (typeof doc === 'object' && doc !== null && doc.name) {
                      return (
                        <a key={idx} href={doc.url} target="_blank" rel="noreferrer" className={styles.docBadge} style={{ textDecoration: 'none' }}>
                          <FileText size={16} className={styles.docBadgeIcon} />
                          <span>{doc.name}</span>
                        </a>
                      )
                    }
                    // Fallback for legacy string data
                    return (
                      <div key={idx} className={styles.docBadge}>
                        <FileText size={16} className={styles.docBadgeIcon} />
                        <span>{doc}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className={styles.plainSection}>
              <h3 className={styles.plainSectionTitle}>Opsi Penjemputan</h3>
              <p className={styles.pickupText}>
                {finalOpsiPenjemputan.join(', ')}
              </p>
            </div>

            <div className={styles.divider} style={{ margin: '2rem 0' }} />

            {/* Policies & Info */}
            <section className={styles.section}>
              <div className={styles.policyBox}>
                <div className={styles.policyBoxHeader}>
                  <AlertCircle size={20} className={styles.infoIcon} />
                  <h3>Kebijakan Pembatalan & Pengembalian Dana</h3>
                </div>
                <ul className={styles.infoList}>
                  {finalKebijakan.map((policy: string, idx: number) => (
                    <li key={idx}>{policy}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.infoBox}>
                <div className={styles.infoBoxHeader}>
                  <Info size={20} className={styles.infoIcon} />
                  <h3>Informasi Penting</h3>
                </div>
                <ul className={styles.infoList}>
                  {finalInfoPenting.map((info: string, idx: number) => (
                    <li key={idx}>{info}</li>
                  ))}
                </ul>
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
              
              <BookingForm 
                paketId={pkg?.id as number}
                paketNama={pkg?.nama as string}
                hargaString={formattedHarga}
                whatsappNumber={settingsObj.whatsapp_number || "6281234567890"}
              />
              
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
