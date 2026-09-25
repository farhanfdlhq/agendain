import AirplaneLoader from "@/components/ui/airplane-loader"
import styles from "./loading.module.css"

export default function Loading() {
  return (
    <div className={styles.wrap}>
      <div className={styles.scene} aria-hidden="true">
        <span className={styles.path} />
        <span className={`${styles.dot} ${styles.dotStart}`} />
        <span className={`${styles.dot} ${styles.dotEnd}`} />
        {/* AirplaneLoader (getar + garis-angin) diterbangkan mulus menyusuri
            jalur oleh animasi CSS .plane — gabungan gerak, bukan replay kaku. */}
        <AirplaneLoader size={24} className={styles.plane} />
      </div>
      <h3 className={styles.title}>Sedang Memuat...</h3>
      <p className={styles.subtitle}>Menyiapkan destinasi dan paket perjalanan terbaik untuk Anda.</p>
    </div>
  )
}
