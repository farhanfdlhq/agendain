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
              Selamat datang di Agendain. Kami menyadari bahwa data pribadi Anda adalah aset yang sangat berharga. Sebagai biro perjalanan spesialis destinasi Eropa terkemuka di Indonesia, kami berkomitmen penuh untuk melindungi privasi dan keamanan setiap informasi yang Anda percayakan kepada kami, baik saat Anda menjelajahi agendain.com maupun saat Anda bepergian bersama kami.
            </p>
            <p>
              Kebijakan Privasi ini disusun secara transparan untuk menjelaskan bagaimana kami mengumpulkan, merawat, dan menggunakan data Anda. Dengan menggunakan layanan eksklusif kami (Open Trip, Private Trip, maupun Konsultasi Perjalanan), Anda setuju dengan standar tata kelola data yang dijelaskan di bawah ini.
            </p>

            <h2>2. Data yang Kami Kumpulkan</h2>
            <p>Kami mengumpulkan informasi dari kamu dalam beberapa cara berikut:</p>
            
            <h3>Data yang Anda berikan secara langsung:</h3>
            <ul>
              <li><strong>Informasi Identitas:</strong> Nama lengkap, tanggal lahir, dan detail demografis lainnya untuk administrasi perjalanan.</li>
              <li><strong>Dokumen Perjalanan Internasional:</strong> Nomor paspor, masa berlaku, dan pindaian fisik paspor (dokumen ini esensial untuk keperluan pengajuan Visa Schengen / Visa Eropa lainnya).</li>
              <li><strong>Jalur Komunikasi:</strong> Nomor WhatsApp aktif, alamat email utama, dan alamat domisili untuk pengiriman dokumen fisik (jika diperlukan).</li>
              <li><strong>Informasi Finansial:</strong> Bukti transfer atau kuitansi pembayaran (Kami <strong>tidak pernah</strong> menyimpan data nomor kartu kredit/debit atau PIN bank Anda).</li>
              <li><strong>Preferensi Pribadi:</strong> Permintaan khusus terkait diet (Halal/Vegan), riwayat medis ringan, atau preferensi kenyamanan akomodasi hotel selama di Eropa.</li>
            </ul>

            <h3>Data yang dikumpulkan secara otomatis:</h3>
            <ul>
              <li>Alamat IP dan tipe browser saat mengunjungi website kami</li>
              <li>Halaman yang dikunjungi, durasi kunjungan, dan sumber traffic</li>
              <li>Data perangkat (desktop, mobile, sistem operasi)</li>
            </ul>

            <h2>3. Bagaimana Kami Menggunakan Data Anda</h2>
            <p>Seluruh informasi yang kami himpun didedikasikan sepenuhnya untuk mewujudkan pengalaman liburan Eropa yang tak terlupakan bagi Anda:</p>
            <ul>
              <li><strong>Eksekusi Perjalanan:</strong> Mulai dari konfirmasi *booking*, penjadwalan *itinerary*, hingga koordinasi titik temu keberangkatan (Meeting Point).</li>
              <li><strong>Fasilitasi Visa:</strong> Pengajuan dokumen secara legal dan aman ke pihak Kedutaan Besar atau lembaga resmi (seperti VFS Global / TLScontact).</li>
              <li><strong>Reservasi Lintas Negara:</strong> Pendaftaran tiket pesawat, reservasi hotel bintang lima, transportasi lokal, hingga tiket masuk objek wisata ikonis atas nama Anda.</li>
              <li><strong>Komunikasi Proaktif:</strong> Mengirimkan *update* penting, pengingat persiapan keberangkatan, dan panduan cuaca ke email atau WhatsApp Anda.</li>
              <li><strong>Inovasi Layanan:</strong> Menggunakan analisa data *traffic* anonim untuk terus memoles antarmuka website dan merancang rute liburan baru yang lebih efisien.</li>
              <li><strong>Kepatuhan Hukum Internasional:</strong> Mematuhi regulasi imigrasi dan hukum perlindungan data yang berlaku di Indonesia serta yurisdiksi negara tujuan.</li>
            </ul>

          </div>
        </FadeIn>
      </div>
    </div>
  )
}
