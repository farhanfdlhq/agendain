import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import BookingForm from '@/components/BookingForm/BookingForm'
import GalleryLightbox from '@/components/GalleryLightbox/GalleryLightbox'
import { Clock, MapPin, Tag, CalendarClock, Info, AlertCircle, CheckCircle2, FileText, Car } from 'lucide-react'
import { formatIDR, formatUSD, formatEUR, fetchExchangeRates } from '@/lib/currency'
import { getServerLocale, getServerT } from '@/lib/i18n/server'
import { pickLocalized } from '@/lib/i18n/localize'

export const revalidate = 3600 // Cache for 1 hour

export default async function PaketDetail(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params

  const [pkg, settingsArr, rates, locale, t] = await Promise.all([
    prisma.openTrip.findUnique({
      where: { slug },
      include: { destinasi: true }
    }),
    prisma.$queryRaw`SELECT * FROM Setting`.catch(() => [] as any[]),
    fetchExchangeRates().catch(() => ({ USD: 0.000063, EUR: 0.000058 })),
    getServerLocale(),
    getServerT()
  ])

  let settingsObj = (settingsArr as any[]).reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {})

  if (!pkg) {
    notFound()
  }

  // Setting global versi bahasa aktif; `_en` kosong jatuh ke versi Indonesia.
  const gset = (key: string): string | undefined =>
    (locale === 'en' && settingsObj[`${key}_en`]) || settingsObj[key]

  // Isi paket: kolom `*En` bila admin sudah mengisinya, kalau tidak versi Indonesia.
  const nama = pickLocalized<string>(pkg, 'nama', locale)
  const deskripsi = pickLocalized<string>(pkg, 'deskripsi', locale)

  // Parse custom info/policy or fallback to global settings
  let finalInfoPenting = []
  const infoPenting = pickLocalized<any[]>(pkg, 'informasiPenting', locale)
  if (Array.isArray(infoPenting) && infoPenting.length > 0) {
    finalInfoPenting = infoPenting
  } else if (gset('global_informasi_penting')) {
    finalInfoPenting = gset('global_informasi_penting')!.split('\n').filter((s: string) => s.trim())
  } else {
    finalInfoPenting = [
      t('openTrip.detail.fallbackInfo1'),
      t('openTrip.detail.fallbackInfo2'),
      t('openTrip.detail.fallbackInfo3')
    ]
  }

  let finalKebijakan = []
  const kebijakan = pickLocalized<any[]>(pkg, 'kebijakanPembatalan', locale)
  if (Array.isArray(kebijakan) && kebijakan.length > 0) {
    finalKebijakan = kebijakan
  } else if (gset('global_kebijakan_pembatalan')) {
    finalKebijakan = gset('global_kebijakan_pembatalan')!.split('\n').filter((s: string) => s.trim())
  } else {
    finalKebijakan = [
      t('openTrip.detail.fallbackPolicy1'),
      t('openTrip.detail.fallbackPolicy2'),
      t('openTrip.detail.fallbackPolicy3'),
      t('openTrip.detail.fallbackPolicy4')
    ]
  }

  let finalFileDokumen: any[] = []
  if (Array.isArray(pkg.fileDokumen) && pkg.fileDokumen.length > 0) {
    finalFileDokumen = pkg.fileDokumen
  }

  let finalOpsiPenjemputan = []
  const opsiPenjemputan = pickLocalized<any[]>(pkg, 'opsiPenjemputan', locale)
  if (Array.isArray(opsiPenjemputan) && opsiPenjemputan.length > 0) {
    finalOpsiPenjemputan = opsiPenjemputan
  } else if (gset('global_opsi_penjemputan')) {
    finalOpsiPenjemputan = gset('global_opsi_penjemputan')!.split('\n').filter((s: string) => s.trim())
  } else {
    finalOpsiPenjemputan = [
      t('openTrip.detail.fallbackPickup1'),
      t('openTrip.detail.fallbackPickup2'),
      t('openTrip.detail.fallbackPickup3')
    ]
  }

  let mainImage = '/placeholder.webp'
  let gallery: string[] = []

  if (Array.isArray(pkg?.foto) && pkg.foto.length > 0) {
    gallery = pkg.foto.map((f: any) => {
      if (typeof f === 'string') return f
      if (typeof f === 'object' && f !== null) return f.full || f.medium || f.thumb || '/placeholder.webp'
      return '/placeholder.webp'
    })
    mainImage = gallery[0]
  } else if (pkg?.foto && typeof pkg.foto === 'object') {
    const fotos = pkg.foto as any
    mainImage = fotos.full || fotos.large || fotos.medium || '/placeholder.webp'
    if (Array.isArray(fotos.gallery) && fotos.gallery.length > 0) {
      gallery = fotos.gallery
    }
  }

  if (gallery.length === 0) {
    gallery = [mainImage, mainImage, mainImage, mainImage, mainImage]
  }


  const hargaIDRNum = Number(pkg?.harga || 0)
  const formattedHarga = formatIDR(hargaIDRNum)
  const formattedUSD = formatUSD(hargaIDRNum * (rates.USD || 0.000063))
  const formattedEUR = formatEUR(hargaIDRNum * (rates.EUR || 0.000058))

  const itinerary = pickLocalized<any[]>(pkg, 'itinerary', locale) || []
  const fasilitas = pickLocalized<string[]>(pkg, 'fasilitas', locale) || []
  const termasuk = pickLocalized<string[]>(pkg, 'termasuk', locale) || []
  const tidakTermasuk = pickLocalized<string[]>(pkg, 'tidakTermasuk', locale) || []
  const destinasiNama = pickLocalized<string>(pkg.destinasi, 'nama', locale)

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/">{t('nav.home')}</Link> <span className={styles.separator}>/</span>
          <Link href="/open-trip">Open Trip</Link> <span className={styles.separator}>/</span>
          <span className={styles.current}>{nama}</span>
        </div>

        {/* Title */}
        <h1 className={styles.title}>{nama}</h1>

        {/* Photo Gallery with Lightbox */}
        <GalleryLightbox images={gallery} title={nama} />

        {/* Quick Info Cards */}
        <div className={styles.quickInfoGrid}>
          <div className={styles.quickInfoCard}>
            <Clock className={styles.quickIcon} />
            <div className={styles.quickText}>
              <span className={styles.quickLabel}>{t('openTrip.detail.duration')}</span>
              <span className={styles.quickValue}>{pkg.durasi} {t('openTrip.detail.days')}</span>
            </div>
          </div>
          <div className={styles.quickInfoCard}>
            <MapPin className={styles.quickIcon} />
            <div className={styles.quickText}>
              <span className={styles.quickLabel}>{t('openTrip.detail.destination')}</span>
              <span className={styles.quickValue}>{destinasiNama}</span>
            </div>
          </div>
          <div className={styles.quickInfoCard}>
            <Tag className={styles.quickIcon} />
            <div className={styles.quickText}>
              <span className={styles.quickLabel}>{t('openTrip.detail.category')}</span>
              <span className={styles.quickValue}>{pkg.label || 'Open Trip'}</span>
            </div>
          </div>
          <div className={styles.quickInfoCard}>
            <CalendarClock className={styles.quickIcon} />
            <div className={styles.quickText}>
              <span className={styles.quickLabel}>{t('openTrip.detail.departure')}</span>
              <span className={styles.quickValue}>{t('openTrip.detail.departureValue')}</span>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className={styles.layout}>
          {/* Left Column */}
          <div className={styles.mainContent}>

            {/* Deskripsi */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('openTrip.detail.summary')}</h2>
              <p className={styles.descText}>{deskripsi}</p>
            </section>

            <div className={styles.divider} />

            {/* Highlights */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('openTrip.detail.highlights')}</h2>
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
              <h2 className={styles.sectionTitle}>{t('openTrip.detail.incExc')}</h2>
              <div className={styles.incExcGrid}>
                <div className={styles.incBox}>
                  <h3 className={styles.subTitle}>{t('openTrip.detail.included')}</h3>
                  <ul className={styles.list}>
                    {termasuk.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                <div className={styles.excBox}>
                  <h3 className={styles.subTitle}>{t('openTrip.detail.excluded')}</h3>
                  <ul className={styles.listExc}>
                    {tidakTermasuk.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </section>

            <div className={styles.divider} />

            {/* Itinerary */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('openTrip.detail.itinerary')}</h2>
              <div className={styles.itineraryContainer}>
                {itinerary.map((it, i) => {
                  // Mencegah judul dobel jika user mengetik "Hari 1"/"Day 1" di field judul
                  const rawJudul = it.judul || ''
                  const dayWord = t('openTrip.detail.day')
                  const regex = new RegExp(`^(Hari|Day|${dayWord})\\s*${it.hari}\\s*[-:–]*\\s*`, 'i')
                  let cleanJudul = rawJudul.replace(regex, '').trim()
                  // Jika judul aslinya cuma "Hari 1", cleanJudul jadi kosong
                  if (cleanJudul.toLowerCase() === `hari ${it.hari}` || cleanJudul.toLowerCase() === `${dayWord} ${it.hari}`.toLowerCase()) {
                    cleanJudul = ''
                  }

                  return (
                    <div key={i} className={styles.itDay}>
                      <div className={styles.dayDot}></div>
                      <div className={styles.dayContent}>
                        <h4>
                          <span className={styles.dayLabel}>{dayWord} {it.hari}</span>
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
                <h3 className={styles.plainSectionTitle}>{t('openTrip.detail.files')}</h3>
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
              <h3 className={styles.plainSectionTitle}>{t('openTrip.detail.pickup')}</h3>
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
                  <h3>{t('openTrip.detail.cancellation')}</h3>
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
                  <h3>{t('openTrip.detail.important')}</h3>
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
                <span className={styles.priceUnit}>{t('openTrip.detail.perPax')}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '16px', display: 'flex', gap: '8px' }}>
                <span>≈ {formattedUSD}</span> • <span>{formattedEUR}</span>
              </div>

              <BookingForm
                openTripId={pkg?.id as number}
                paketNama={nama}
                hargaString={formattedHarga}
                whatsappNumber={settingsObj.whatsapp_number || "6281234567890"}
              />

              <div className={styles.waOption}>
                <p>{t('openTrip.detail.waPrompt')}</p>
                <a href={`https://wa.me/${settingsObj.whatsapp_number?.replace(/\D/g, '') || "6281234567890"}?text=${encodeURIComponent(`${t('openTrip.detail.waText')} ${nama}`)}`}
                   target="_blank" rel="noreferrer" className={styles.waBtn}>
                  {t('openTrip.detail.waBtn')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
