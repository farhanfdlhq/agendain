'use client'

import styles from './page.module.css'
import HeroHeader from '@/components/HeroHeader/HeroHeader'
import FadeIn from '@/components/Motion/FadeIn'

export default function PrivacyPolicyContent() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <HeroHeader 
        backgroundImage="/hero-coastal.webp"
        title={<>Privacy <span className={styles.textGold}>Policy</span></>}
        subtitle="Agendain berkomitmen menjaga keamanan dan kerahasiaan data pribadi kamu. Halaman ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasimu."
        minHeight="500px"
        paddingBottom="150px"
      />

      <div className={styles.container}>
        <FadeIn direction="up" delay={0.2}>
          <div className={styles.contentCard}>
            
            <h2>1. Pendahuluan</h2>
            <p>
              Selamat datang di Agendain (&quot;kami&quot;, &quot;milik kami&quot;). Agendain adalah agen perjalanan yang berfokus pada wisata ke Eropa, melayani open trip dan private trip untuk pelanggan dari seluruh Indonesia. Kebijakan Privasi ini berlaku untuk seluruh layanan kami, termasuk website agendain.com, komunikasi via WhatsApp, email, dan platform lainnya.
            </p>
            <p>
              Dengan menggunakan layanan kami atau menghubungi Agendain, kamu menyetujui praktik pengumpulan dan penggunaan data sebagaimana dijelaskan dalam kebijakan ini. Kami mendorong kamu untuk membaca halaman ini secara menyeluruh.
            </p>

            <h2>2. Data yang Kami Kumpulkan</h2>
            <p>Kami mengumpulkan informasi dari kamu dalam beberapa cara berikut:</p>
            
            <h3>Data yang kamu berikan secara langsung:</h3>
            <ul>
              <li><strong>Identitas:</strong> nama lengkap, tanggal lahir, jenis kelamin</li>
              <li><strong>Dokumen perjalanan:</strong> nomor paspor, tanggal berlaku paspor, foto paspor (diperlukan untuk proses visa Schengen / Eropa)</li>
              <li><strong>Kontak:</strong> nomor WhatsApp, alamat email, kota asal</li>
              <li><strong>Pembayaran:</strong> bukti transfer (kami tidak menyimpan data kartu kredit/debit)</li>
              <li><strong>Preferensi perjalanan:</strong> pilihan makanan (halal/non-halal), kebutuhan khusus, preferensi hotel</li>
            </ul>

            <h3>Data yang dikumpulkan secara otomatis:</h3>
            <ul>
              <li>Alamat IP dan tipe browser saat mengunjungi website kami</li>
              <li>Halaman yang dikunjungi, durasi kunjungan, dan sumber traffic</li>
              <li>Data perangkat (desktop, mobile, sistem operasi)</li>
            </ul>

            <h2>3. Bagaimana Kami Menggunakan Datamu (Penggunaan Data)</h2>
            <p>Data yang kami kumpulkan digunakan semata-mata untuk keperluan berikut:</p>
            <ul>
              <li><strong>Proses pemesanan trip:</strong> konfirmasi booking, penjadwalan, dan koordinasi keberangkatan</li>
              <li><strong>Pengurusan visa:</strong> data paspor diperlukan untuk pengajuan visa ke kedutaan atau lembaga resmi terkait</li>
              <li><strong>Komunikasi:</strong> mengirimkan informasi trip, itinerary, reminder pembayaran, dan update penting via WhatsApp atau email</li>
              <li><strong>Pemesanan layanan perjalanan:</strong> tiket pesawat, hotel, transportasi, dan tiket destinasi wisata atas nama peserta</li>
              <li><strong>Peningkatan layanan:</strong> menganalisis feedback dan data kunjungan website untuk memperbaiki pengalaman pengguna</li>
              <li><strong>Kepatuhan hukum:</strong> memenuhi kewajiban regulasi di Indonesia terkait data perjalanan internasional</li>
            </ul>

          </div>
        </FadeIn>
      </div>
    </div>
  )
}
