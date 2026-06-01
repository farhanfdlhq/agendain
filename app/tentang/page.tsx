import Image from 'next/image'
import styles from './page.module.css'
import { Shield, Target, Heart, Award } from 'lucide-react'

export const metadata = {
  title: 'Tentang Kami | Agendain',
  description: 'Mengenal lebih dekat Agendain, partner perjalanan Eropa terpercaya Anda.',
}

export default function TentangPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <Image 
          src="https://images.unsplash.com/photo-1522083165195-3444ced7e363?q=80&w=2070&auto=format&fit=crop" 
          alt="Tentang Agendain" 
          fill 
          priority 
          className={styles.heroImage} 
        />
        <div className={styles.overlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Lebih Dekat dengan Agendain</h1>
          <p className={styles.subtitle}>Mewujudkan impian perjalanan Eropa Anda dengan layanan terbaik, pengalaman tak terlupakan, dan kepuasan pelanggan sebagai prioritas kami.</p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.storySection}>
          <div className={styles.storyText}>
            <h2 className={styles.sectionTitle}>Cerita Kami</h2>
            <p className={styles.paragraph}>
              Didirikan pada tahun 2020 di tengah tantangan global, Agendain lahir dari hasrat sederhana: menjembatani keindahan benua biru Eropa dengan para pelancong dari Indonesia. Kami percaya bahwa setiap perjalanan bukan sekadar mengunjungi tempat baru, melainkan tentang merangkai memori, memperkaya jiwa, dan membuka sudut pandang baru.
            </p>
            <p className={styles.paragraph}>
              Sebagai spesialis tur Eropa, kami telah menyusun ratusan itinerary, mulai dari perjalanan klasik menyusuri keromantisan Paris, hingga petualangan mendebarkan di pegunungan Alpen Swiss. Tim profesional kami berdedikasi untuk memberikan layanan personal dan fleksibel, memastikan setiap perjalanan terasa eksklusif dan tak terlupakan.
            </p>
          </div>
          <div className={styles.storyImageWrapper}>
            <Image 
              src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop"
              alt="Perjalanan Eropa"
              fill
              className={styles.storyImage}
            />
          </div>
        </div>

        <section className={styles.valuesSection}>
          <h2 className={styles.sectionTitle} style={{textAlign: 'center', marginBottom: '40px'}}>Nilai-Nilai Kami</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.iconWrapper}>
                <Shield size={32} color="var(--color-primary)" />
              </div>
              <h3 className={styles.valueTitle}>Keamanan & Kepercayaan</h3>
              <p className={styles.valueDesc}>Keamanan Anda adalah prioritas kami. Kami bekerja sama dengan mitra terpercaya di seluruh Eropa untuk memastikan perjalanan yang tenang dan aman.</p>
            </div>
            
            <div className={styles.valueCard}>
              <div className={styles.iconWrapper}>
                <Heart size={32} color="var(--color-primary)" />
              </div>
              <h3 className={styles.valueTitle}>Layanan Sepenuh Hati</h3>
              <p className={styles.valueDesc}>Kami mendengarkan dan memahami kebutuhan Anda, memberikan pelayanan personal yang hangat seolah melayani keluarga sendiri.</p>
            </div>
            
            <div className={styles.valueCard}>
              <div className={styles.iconWrapper}>
                <Award size={32} color="var(--color-primary)" />
              </div>
              <h3 className={styles.valueTitle}>Kualitas Premium</h3>
              <p className={styles.valueDesc}>Dari akomodasi hingga transportasi, kami menjamin standar kualitas tinggi yang sepadan dengan nilai investasi perjalanan Anda.</p>
            </div>
            
            <div className={styles.valueCard}>
              <div className={styles.iconWrapper}>
                <Target size={32} color="var(--color-primary)" />
              </div>
              <h3 className={styles.valueTitle}>Itinerary Terarah</h3>
              <p className={styles.valueDesc}>Perencanaan matang dengan efisiensi waktu, namun tetap fleksibel agar Anda tidak merasa terburu-buru menikmati setiap destinasi.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
