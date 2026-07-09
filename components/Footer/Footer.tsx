'use client'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/useTranslation'
import styles from './Footer.module.css'

export default function Footer({ settings }: { settings?: any }) {
  const { t } = useTranslation()
  const siteName = settings?.site_name || "agendain"
  const siteLogo = settings?.site_logo && settings.site_logo !== "/logo.png" ? settings.site_logo : "/agendain.jpeg"

  return (
    <footer className={styles.footer} suppressHydrationWarning>
      {/* Top Band with tagline */}
      <div className={styles.topBand} suppressHydrationWarning>
        <div className={styles.container} suppressHydrationWarning>
          <div className={styles.topBandInner}>
            <Link href="/" className={styles.footerLogo}>
              {siteLogo ? (
                <img 
                  src={siteLogo} 
                  alt={siteName} 
                  className={styles.footerLogoImg} 
                  style={{ '--logo-height': settings?.logo_height ? `${settings.logo_height}px` : undefined } as React.CSSProperties}
                />
              ) : (
                <span className={styles.footerLogoText}>{siteName}</span>
              )}
            </Link>
            <div className={styles.topBandDivider} />
            <p className={styles.topBandTagline}>
              Mau Jalan tapi Wacana Doang? <strong>Agendain aja!</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className={styles.mainFooter} suppressHydrationWarning>
        <div className={styles.container} suppressHydrationWarning>
          <div className={styles.columns} suppressHydrationWarning>
            {/* Navigasi */}
            <div className={styles.col} suppressHydrationWarning>
              <h3 className={styles.colTitle}>Navigasi</h3>
              <ul className={styles.links}>
                <li><Link href="/">Beranda</Link></li>
                <li><Link href="/paket">Open Trip</Link></li>
                <li><Link href="/private-trip">Private Trip</Link></li>
              </ul>
            </div>

            {/* Hubungi */}
            <div className={styles.col} suppressHydrationWarning>
              <h3 className={styles.colTitle}>Hubungi</h3>
              <ul className={styles.links}>
                <li>
                  <a href="https://instagram.com/agendain.id" target="_blank" rel="noopener noreferrer">
                    <span className={styles.socialIcon}>📷</span> @agendain.id
                  </a>
                </li>
                <li>
                  <a href="https://youtube.com/@agendain" target="_blank" rel="noopener noreferrer">
                    <span className={styles.socialIcon}>▶️</span> Youtube
                  </a>
                </li>
                <li>
                  <a href="https://twitter.com/agendain" target="_blank" rel="noopener noreferrer">
                    <span className={styles.socialIcon}>🐦</span> Twitter
                  </a>
                </li>
                <li>
                  <a href="mailto:info@agendain.com">
                    <span className={styles.socialIcon}>✉️</span> info@agendain.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Payment Partners */}
            <div className={styles.col} suppressHydrationWarning>
              <h3 className={styles.colTitle}>Payment Partners</h3>
              <div className={styles.paymentGrid}>
                {['Visa', 'Mastercard', 'Maestro', 'Amex', 'G Pay', 'BCA', 'BNI', 'Mandiri'].map((name) => (
                  <div key={name} className={styles.paymentBadge}>
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className={styles.bottom} suppressHydrationWarning>
        <div className={styles.container} suppressHydrationWarning>
          <p>&copy; {new Date().getFullYear()} {siteName}. {t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
