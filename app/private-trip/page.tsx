import Image from 'next/image'
import styles from './page.module.css'

export default function PrivateTripPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <Image 
          src="https://images.unsplash.com/photo-1516483638261-f40889c28a5d?q=80&w=2070&auto=format&fit=crop" 
          alt="Private Trip Eropa" 
          fill 
          priority 
          className={styles.heroImage} 
        />
        <div className={styles.overlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Private Trip Eropa</h1>
          <p className={styles.subtitle}>Eksplorasi Eropa dengan itinerary yang dirancang khusus untuk Anda dan orang-orang terdekat.</p>
        </div>
      </div>
      
      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.content}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Mengapa Memilih Private Trip?</h2>
              <div className={styles.features}>
                <div className={styles.feature}>
                  <span className={styles.icon}>🎯</span>
                  <div>
                    <h3>Itinerary Custom</h3>
                    <p>Bebas menentukan negara, kota, dan durasi sesuai keinginan Anda tanpa terikat jadwal grup.</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.icon}>🕒</span>
                  <div>
                    <h3>Waktu Fleksibel</h3>
                    <p>Tidak perlu terburu-buru. Anda bebas menentukan kapan ingin berangkat dan bersantai.</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.icon}>👨‍👩‍👧‍👦</span>
                  <div>
                    <h3>Eksklusif & Privat</h3>
                    <p>Nikmati perjalanan hanya bersama keluarga atau kerabat terdekat Anda dengan privasi penuh.</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.icon}>🚗</span>
                  <div>
                    <h3>Fasilitas VIP</h3>
                    <p>Dari mobil pribadi hingga rekomendasi restoran Michelin Star, kami atur semuanya.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
          
          <div className={styles.sidebar}>
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>Ajukan Private Trip</h3>
              <p className={styles.formDesc}>Ceritakan rencana perjalanan Anda, Travel Consultant kami akan merancang penawaran terbaik.</p>
              
              <form className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="nama">Nama Lengkap</label>
                  <input type="text" id="nama" className={styles.input} required />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" className={styles.input} required />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="nowa">No. WhatsApp</label>
                  <input type="tel" id="nowa" className={styles.input} required />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="destinasi">Destinasi yang Diinginkan</label>
                  <input type="text" id="destinasi" placeholder="Misal: Swiss, Paris, Amsterdam" className={styles.input} required />
                </div>
                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="tanggal">Rencana Tanggal</label>
                    <input type="month" id="tanggal" className={styles.input} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="pax">Jumlah Pax</label>
                    <input type="number" id="pax" min="2" defaultValue="2" className={styles.input} required />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="budget">Estimasi Budget per Orang</label>
                  <select id="budget" className={styles.input}>
                    <option value="< 20jt">&lt; Rp 20.000.000</option>
                    <option value="20jt-30jt">Rp 20.000.000 - Rp 30.000.000</option>
                    <option value="30jt-50jt">Rp 30.000.000 - Rp 50.000.000</option>
                    <option value="> 50jt">&gt; Rp 50.000.000</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="catatan">Catatan Tambahan</label>
                  <textarea id="catatan" className={styles.textarea} rows={4} placeholder="Hotel bintang 5, butuh fotografer, dsb."></textarea>
                </div>
                <button type="submit" className={styles.submitBtn}>Kirim Permintaan</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
