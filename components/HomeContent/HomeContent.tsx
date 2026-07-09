'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import FadeIn from '@/components/Motion/FadeIn'
import Stagger from '@/components/Motion/Stagger'
import { ChevronLeft, ChevronRight, Star, ArrowRight } from 'lucide-react'
import styles from './HomeContent.module.css'

/* ──── WhatsApp SVG Icon ──── */
function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

/* ──── Data ──── */
const WHY_CARDS = [
  {
    number: '#1',
    title: 'All-in-One!',
    desc: 'Ga usah ribet ngurus sana-sini. Di Agendain, dari tiket pesawat, hotel, sampai itinerary harian semua udah kami siapin. Kamu tinggal bawa koper dan ajak teman — semuanya sudah beres!',
    image: '/why-hotel.png',
  },
  {
    number: '#2',
    title: 'Harga Terbaik',
    desc: 'Kami bekerja langsung dengan partner lokal di Eropa, jadi harga yang kamu dapat itu harga terbaik, transparan, tanpa biaya tersembunyi. Worth it banget buat pengalaman yang kamu dapat!',
    image: '/placeholder.png',
  },
  {
    number: '#3',
    title: 'Dukungan 24/7',
    desc: 'Tim Agendain selalu stand by 24 jam selama perjalanan kamu. Mulai dari pertanyaan soal hotel, transportasi, atau darurat — kamu ga bakal sendirian. Kami ada di setiap langkah!',
    image: '/why-support.png',
  },
  {
    number: '#4',
    title: 'Dokumentasi Pro',
    desc: 'Setiap momen berharga akan diabadikan secara sinematik oleh tim dokumentasi profesional kami. Pulang liburan bawa foto & video keren tanpa repot mikirin angle!',
    image: '/why-camera.png',
  },
]

const DESTINATIONS = [
  { name: 'France', price: '18 Juta', rating: '5/5', image: '/dest-france.png', slug: 'prancis' },
  { name: 'Swiss', price: '24 Juta', rating: '5/5', image: '/dest-swiss.png', slug: 'swiss' },
  { name: 'Italy', price: '20 Juta', rating: '5/5', image: '/dest-italy.png', slug: 'italia' },
]

const GALLERY_IMAGES = {
  leftTop: '/gallery-amalfi.png',
  leftBottom: '/dest-swiss.png',
  center: '/gallery-colosseum.png',
  rightTop: '/dest-france.png',
  rightBottom: '/dest-italy.png',
}

const ACCORDION_ITEMS = [
  {
    title: 'Tidur Nyenyak Berlatar Sudut Kota yang Estetik',
    body: 'Kami pilihkan hotel-hotel terbaik di lokasi strategis, dekat dengan spot wisata utama. Bangun pagi dengan pemandangan kota Eropa yang estetik langsung dari jendela kamar kamu.',
  },
  {
    title: 'Eksplorasi Bebas Kaku Tanpa Rasa Pusing',
    body: 'Itinerary kami dirancang fleksibel — ada waktu guided tour, ada waktu free time. Jadi kamu bisa eksplor sendiri tanpa khawatir nyasar atau ketinggalan.',
  },
  {
    title: 'Berburu Kuliner Ikonik Langsung dari Tempat Asalnya',
    body: 'Dari pizza Napoli asli, gelato di Roma, sampai croissant hangat di Paris — kami pastikan kamu ngerasain kuliner legendaris langsung di tempat aslinya.',
  },
  {
    title: 'Bawa Pulang Foto Estetik Tanpa Repot Mikirin Angle',
    body: 'Tim dokumentasi profesional kami ikut di setiap perjalanan. Hasil foto dan video-nya cinematic-grade, bukan sekadar snapshots biasa.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Netizen 1',
    text: '"Pengalaman pertama ke Eropa dan semuanya beyond expectations. Dari hotel, makanan, sampai guide-nya — semuanya top. Ga nyesel pilih Agendain!"',
  },
  {
    name: 'Netizen 2',
    text: '"Trip ke Italia bareng Agendain itu magical banget. Itinerary-nya detail, hotelnya strategis, dan yang paling berkesan dokumentasi-nya keren abis!"',
  },
  {
    name: 'Netizen 3',
    text: '"Awalnya ragu karena pertama kali pakai travel agent, tapi Agendain beneran all-in. Harga transparan, support 24 jam, dan hasilnya beyond!"',
  },
]

const FAQ_ITEMS = [
  {
    q: 'Bagaimana cara mendaftar dan booking trip di Agendain?',
    a: 'Kamu bisa langsung hubungi kami via WhatsApp atau isi form booking di website. Tim kami akan bantu proses selanjutnya dari konsultasi sampai pembayaran.',
  },
  {
    q: 'Apa bedanya layanan Open Trip dan Private Trip?',
    a: 'Open Trip adalah trip gabungan dengan peserta lain di tanggal yang sudah ditentukan. Private Trip adalah trip khusus untuk grup kamu sendiri dengan tanggal dan itinerary yang bisa disesuaikan.',
  },
  {
    q: 'Apakah harga paket yang tertera sudah termasuk tiket pesawat?',
    a: 'Tergantung paket yang dipilih. Beberapa paket sudah termasuk tiket pesawat PP, dan beberapa lainnya belum. Detail lengkap tertera di setiap halaman paket.',
  },
  {
    q: 'Bagaimana sistem pembayarannya? Apakah bisa dicicil?',
    a: 'Ya, kami menyediakan sistem pembayaran bertahap (cicilan tanpa bunga). DP minimal 30% dan sisanya bisa dilunasi sebelum keberangkatan sesuai jadwal yang disepakati.',
  },
  {
    q: 'Apakah aman untuk solo traveler yang ingin berangkat sendirian?',
    a: 'Tentu! Banyak peserta kami yang berangkat solo dan justru menemukan teman baru. Tim guide kami selalu memastikan semua peserta nyaman dan aman selama perjalanan.',
  },
]

/* ──── Component ──── */
export default function HomeContent({
  packages,
  destinations,
  homeSettings,
}: {
  packages: any[]
  destinations: any[]
  homeSettings: any
}) {
  const [activeAccordion, setActiveAccordion] = useState(0)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const waNumber = '6281234567890'
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent('Halo, saya ingin bertanya mengenai paket wisata.')}`

  return (
    <>
      {/* ═══════ 1. HERO ═══════ */}
      <section className={styles.hero}>
        <div className={styles.heroImageWrapper}>
          <Image
            src="/hero-coastal.png"
            alt="Pemandangan pantai Eropa yang indah"
            fill
            priority
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroContent}>
          <FadeIn delay={0.2} direction="up">
            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleWhite}>Jangan Cuma Jadi Wacana, </span>
              <span className={styles.heroTitleGold}>Agendain Aja!</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.4} direction="up">
            <p className={styles.heroSubtitle}>
              Dari tiket, hotel, sampai itinerary, semua udah kami siapkan.
              Kamu tinggal ajak teman dan siap berangkat.
            </p>
          </FadeIn>

          <FadeIn delay={0.6} direction="up">
            <div className={styles.heroButtons}>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnWhatsapp}
              >
                <WhatsAppIcon size={20} />
                Hubungi Kami Gratis!
              </a>
              <Link href="/paket" className={styles.btnGold}>
                Agendain Sekarang
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ 2. WHY CHOOSE US ═══════ */}
      <section className={styles.whySection}>
        <div className={styles.container}>
          <FadeIn direction="up">
            <div className={styles.whySectionHeader}>
              <span className={styles.whyBadge}>Masih Ragu?</span>
              <h2 className={styles.whyTitle}>
                <span className={styles.whyTitleDark}>Kenapa </span>
                <span className={styles.whyTitleGold}>Agendain Travel</span>
                <span className={styles.whyTitleDark}> Jadi Solusi Wacana Kamu</span>
              </h2>
            </div>
          </FadeIn>

          {WHY_CARDS.map((card, i) => {
            const isReversed = i % 2 !== 0
            return (
              <FadeIn key={i} direction="up" delay={i * 0.1}>
                <div className={isReversed ? styles.whyCardReverse : styles.whyCard}>
                  <div className={styles.whyCardImage}>
                    <img src={card.image} alt={card.title} loading="lazy" />
                    <div className={isReversed ? styles.whyCardNumberRight : styles.whyCardNumberLeft}>
                      {card.number}
                    </div>
                  </div>
                  <div className={styles.whyCardText}>
                    <h3 className={styles.whyCardTitle}>{card.title}</h3>
                    <p className={styles.whyCardDesc}>{card.desc}</p>
                  </div>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </section>

      {/* ═══════ 3. FAVORITE DESTINATIONS ═══════ */}
      <section className={styles.destSection}>
        <div className={styles.container}>
          <FadeIn direction="up">
            <div className={styles.destHeader}>
              <div className={styles.destHeaderLeft}>
                <p className={styles.destEyebrow}>Eksplor Bersama Agendain</p>
                <h2 className={styles.destTitle}>Favorite Destination</h2>
              </div>
              <Link href="/destinasi" className={styles.destViewAll}>
                Lihat Semua Destinasi <ArrowRight size={18} />
              </Link>
            </div>
          </FadeIn>

          <Stagger className={styles.destGrid}>
            {DESTINATIONS.map((dest) => (
              <Link key={dest.slug} href={`/destinasi/${dest.slug}`} className={styles.destCard}>
                <div className={styles.destCardImageWrapper}>
                  <img src={dest.image} alt={`Destinasi ${dest.name}`} loading="lazy" />
                </div>
                <div className={styles.destCardBody}>
                  <h3 className={styles.destCardName}>{dest.name}</h3>
                  <p className={styles.destCardPrice}>
                    Start From <span className={styles.destCardPriceValue}>{dest.price}</span>
                  </p>
                  <div className={styles.destCardFooter}>
                    <span className={styles.destCardRating}>
                      <Star size={16} fill="#f59e0b" className={styles.destCardRatingStar} />
                      {dest.rating}
                    </span>
                    <span className={styles.destCardBooking}>Booking</span>
                  </div>
                </div>
              </Link>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ═══════ 4. SUDUT PANDANG / TESTIMONIAL GALLERY ═══════ */}
      <section className={styles.testimonialSection}>
        <div className={styles.container}>
          <FadeIn direction="up">
            <div className={styles.testimonialHeader}>
              <span className={styles.testimonialBadge}>Sudut Pandang</span>
              <h2 className={styles.testimonialTitle}>
                &ldquo;Satu Hari di{' '}
                <span className={styles.testimonialTitleHighlight}>Italia</span>
                , dan Gue Langsung Jatuh Cinta!&rdquo;
              </h2>
              <ul className={styles.testimonialHighlights}>
                <li>Jalan-jalan di kota tua yang penuh sejarah</li>
                <li>Kulineran makanan otentik Italia yang bikin nagih</li>
                <li>Foto-foto di spot ikonik yang instagramable banget</li>
              </ul>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <div className={styles.galleryMasonry}>
              {/* Left Column */}
              <div className={styles.galleryCol}>
                <div className={styles.galleryItemSmall}>
                  <img src={GALLERY_IMAGES.leftTop} alt="Amalfi Coast" loading="lazy" />
                </div>
                <div className={styles.galleryItemSmall}>
                  <img src={GALLERY_IMAGES.leftBottom} alt="Swiss Alps" loading="lazy" />
                </div>
              </div>

              {/* Center Column */}
              <div className={styles.galleryCol}>
                <div className={styles.galleryItemTall}>
                  <img src={GALLERY_IMAGES.center} alt="Colosseum Roma" loading="lazy" />
                  <Link href="/paket" className={styles.galleryOverlayBtn}>
                    Eksplor Trip →
                  </Link>
                </div>
              </div>

              {/* Right Column */}
              <div className={styles.galleryCol}>
                <div className={styles.galleryItemSmall}>
                  <img src={GALLERY_IMAGES.rightTop} alt="Paris" loading="lazy" />
                </div>
                <div className={styles.galleryItemSmall}>
                  <img src={GALLERY_IMAGES.rightBottom} alt="Italia" loading="lazy" />
                </div>
              </div>
            </div>
          </FadeIn>

          <div className={styles.testimonialCta}>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.btnWhatsapp}>
              <WhatsAppIcon size={18} />
              Ada Pertanyaan?
            </a>
          </div>
        </div>
      </section>

      {/* ═══════ 5. ACCORDION / LIHAT HIRUP SIMPAN ═══════ */}
      <section className={styles.accordionSection}>
        <div className={styles.container}>
          <div className={styles.accordionLayout}>
            <div className={styles.accordionLeft}>
              <FadeIn direction="up">
                <h2 className={styles.accordionSectionTitle}>
                  Lihat, Hirup, &amp; Simpan Memori
                </h2>
                <p className={styles.accordionSubtitle}>Sudut Terbaik Eropa</p>
              </FadeIn>

              {ACCORDION_ITEMS.map((item, i) => (
                <FadeIn key={i} direction="up" delay={i * 0.05}>
                  <div className={activeAccordion === i ? styles.accordionItemActive : styles.accordionItem}>
                    <button
                      className={styles.accordionTrigger}
                      onClick={() => setActiveAccordion(activeAccordion === i ? -1 : i)}
                      aria-expanded={activeAccordion === i}
                    >
                      <span>{item.title}</span>
                      <span className={activeAccordion === i ? styles.accordionIconOpen : styles.accordionIcon}>+</span>
                    </button>
                    {activeAccordion === i && (
                      <div className={styles.accordionBody}>
                        {item.body}
                      </div>
                    )}
                  </div>
                </FadeIn>
              ))}

              <FadeIn direction="up" delay={0.3}>
                <Link href="/paket" className={styles.accordionBottomBtn}>
                  Pertanyaan Lain <ArrowRight size={16} />
                </Link>
              </FadeIn>
            </div>

            <FadeIn direction="right" delay={0.2}>
              <div className={styles.accordionRight}>
                <img src="/accordion-street.png" alt="Jalanan Eropa yang menawan" loading="lazy" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ 6. SOCIAL PROOF / CELEBRITY ═══════ */}
      <section className={styles.socialProofSection}>
        <div className={styles.socialProofBg}>
          <img src="/dest-italy.png" alt="" aria-hidden="true" />
        </div>
        <div className={`${styles.container} ${styles.socialProofContent}`}>
          <FadeIn direction="left">
            <div className={styles.socialProofLeft}>
              <div className={styles.socialProofImageWrapper}>
                <img src="/el-rumi-syifa.png" alt="El Rumi & Syifa" loading="lazy" />
                <div className={styles.socialProofQuestionMark}>?</div>
              </div>
              <div className={styles.socialProofQuoteCard}>
                <p className={styles.socialProofQuoteName}>El Rumi & Syifa</p>
                <p className={styles.socialProofQuoteText}>
                  Biasanya kalau ngerencanain trip tuh paling pusing nyamain jadwal dan ngurusin printilannya. Pas nyoba pakai Agendain, beneran tinggal bawa koper doang. Itinerary-nya asik, transportasinya nyaman, dan spot-spot di Italia kemarin juara semua. Gak cuma berakhir jadi wacana di grup chat!
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="right" delay={0.2} className={styles.socialProofRightWrapper}>
            <div className={styles.socialProofRight}>
              <h2 className={styles.socialProofRightTitle}>
                Dari <span className={styles.textYellow}>Artis Sampai Netizen</span>, <br className={styles.hideMobile} />
                <span className={styles.textYellow}>Semua Udah Gak Wacana Lagi!</span>
              </h2>
              <p className={styles.socialProofRightSubtitle}>
                Intip cerita seru El Rumi, Syifa, dan ratusan traveler lainnya yang udah berhasil nge-realisasiin liburan impian mereka bareng Agendain.
              </p>

              <div className={styles.testimonialSliderContainer}>
                <div className={styles.testimonialSlider}>
                  <div className={styles.testimonialSlides}>
                    <AnimatePresence initial={false}>
                      {TESTIMONIALS.map((t, idx) => {
                        const prevIdx = activeTestimonial === 0 ? TESTIMONIALS.length - 1 : activeTestimonial - 1
                        const nextIdx = activeTestimonial === TESTIMONIALS.length - 1 ? 0 : activeTestimonial + 1
                        
                        let positionClass = styles.testimonialSlideHidden
                        if (idx === activeTestimonial) positionClass = styles.testimonialSlideActive
                        else if (idx === prevIdx) positionClass = styles.testimonialSlideInactivePrev
                        else if (idx === nextIdx) positionClass = styles.testimonialSlideInactiveNext

                        if (positionClass === styles.testimonialSlideHidden) return null

                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, zIndex: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`${styles.testimonialSlideBase} ${positionClass}`}
                          >
                            <p className={styles.testimonialSlideName}>{t.name}</p>
                            <p className={styles.testimonialSlideText}>{t.text}</p>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>

                <button
                  className={styles.sliderBtnLeft}
                  onClick={() => setActiveTestimonial(prev => prev === 0 ? TESTIMONIALS.length - 1 : prev - 1)}
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft size={24} color="#ffffff" />
                </button>
                <button
                  className={styles.sliderBtnRight}
                  onClick={() => setActiveTestimonial(prev => prev === TESTIMONIALS.length - 1 ? 0 : prev + 1)}
                  aria-label="Next testimonial"
                >
                  <ChevronRight size={24} color="#ffffff" />
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ 7. FAQ ═══════ */}
      <section className={styles.faqSection}>
        <div className={styles.container}>
          <FadeIn direction="up">
            <div className={styles.faqHeader}>
              <span className={styles.faqBadge}>
                <span className={styles.faqBadgeQ}>?</span> Faq
              </span>
              <h2 className={styles.faqTitle}>Pertanyaan yang Sering Diajukan</h2>
              <p className={styles.faqSubtitle}>
                Temukan jawaban untuk pertanyaan umum tentang layanan Agendain Travel
              </p>
            </div>
          </FadeIn>

          <div className={styles.faqList}>
            {FAQ_ITEMS.map((item, i) => (
              <FadeIn key={i} direction="up" delay={i * 0.05}>
                <div className={styles.faqItem}>
                  <button
                    className={styles.faqTrigger}
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    aria-expanded={activeFaq === i}
                  >
                    <span>{item.q}</span>
                    <span className={activeFaq === i ? styles.faqIconOpen : styles.faqIcon}>+</span>
                  </button>
                  {activeFaq === i && (
                    <div className={styles.faqBody}>{item.a}</div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn direction="up" delay={0.3}>
            <div className={styles.faqCta}>
              <p className={styles.faqCtaText}>
                Masih ada pertanyaan lain? Kawan Agendain siap menjawab!
              </p>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.btnWhatsapp}>
                <WhatsAppIcon size={18} />
                Hubungi Kami
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
