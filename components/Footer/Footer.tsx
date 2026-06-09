'use client'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/useTranslation'
import styles from './Footer.module.css'

export default function Footer({ settings }: { settings?: any }) {
  const { t } = useTranslation()
  const siteName = settings?.site_name || "Agendain"
  const siteLogo = settings?.site_logo && settings.site_logo !== "/logo.png" ? settings.site_logo : "/agendain.jpeg"

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.col}>
            <Link href="/" className={styles.logo}>
              {siteLogo ? (
                <img src={siteLogo} alt={siteName} style={{ height: "40px", objectFit: "contain", marginBottom: "8px" }} />
              ) : (
                siteName
              )}
            </Link>
            <p className={styles.desc}>{t('footer.desc')}</p>
          </div>
          <div className={styles.col}>
            <h3 className={styles.title}>{t('footer.mainMenu')}</h3>
            <ul className={styles.links}>
              <li><Link href="/paket">{t('nav.packages')}</Link></li>
              <li><Link href="/destinasi">{t('nav.destinations')}</Link></li>
              <li><Link href="/private-trip">{t('nav.privateTrip')}</Link></li>
            </ul>
          </div>
          <div className={styles.col}>
            <h3 className={styles.title}>{t('footer.help')}</h3>
            <ul className={styles.links}>
              <li><Link href="/tentang">{t('nav.about')}</Link></li>
              <li>
                <a 
                  href={`https://wa.me/${settings?.whatsapp_number?.replace(/\D/g, '') || "6281234567890"}?text=${encodeURIComponent(settings?.whatsapp_message || "Halo, saya ingin bertanya mengenai paket wisata.")}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {t('nav.contact')}
                </a>
              </li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.container}>
          <p>&copy; {new Date().getFullYear()} {siteName}. {t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
