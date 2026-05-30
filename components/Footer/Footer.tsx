import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.col}>
            <Link href="/" className={styles.logo}>Agendain</Link>
            <p className={styles.desc}>Travel agency digital terpercaya untuk perjalanan Anda dari Indonesia ke Eropa.</p>
          </div>
          <div className={styles.col}>
            <h3 className={styles.title}>Menu Utama</h3>
            <ul className={styles.links}>
              <li><Link href="/paket">Paket Wisata</Link></li>
              <li><Link href="/destinasi">Destinasi</Link></li>
              <li><Link href="/private-trip">Private Trip</Link></li>
            </ul>
          </div>
          <div className={styles.col}>
            <h3 className={styles.title}>Bantuan</h3>
            <ul className={styles.links}>
              <li><Link href="/tentang">Tentang Kami</Link></li>
              <li><Link href="/kontak">Hubungi Kami</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.container}>
          <p>&copy; {new Date().getFullYear()} Agendain. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
