'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Mail } from 'lucide-react'
import InstagramIcon from '@/components/icons/mdi_instagram.svg'
import YoutubeIcon from '@/components/icons/mdi_youtube.svg'
import TwitterIcon from '@/components/icons/mdi_twitter.svg'
import MailIcon from '@/components/icons/ic_baseline-email.svg'
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
            <p className={styles.topBandTagline} dangerouslySetInnerHTML={{ __html: t('footer.tagline') || 'Mau Jalan tapi Wacana Doang? <strong>Agendain aja!</strong>' }} />
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className={styles.mainFooter} suppressHydrationWarning>
        <div className={styles.container} suppressHydrationWarning>
          <div className={styles.columns} suppressHydrationWarning>
            {/* Navigasi */}
            <div className={styles.col} suppressHydrationWarning>
              <h3 className={styles.colTitle}>{t('footer.mainMenu') || 'Navigasi'}</h3>
              <ul className={styles.links}>
                <li><Link href="/">{t('nav.home')}</Link></li>
                <li><Link href="/tentang">{t('nav.about')}</Link></li>
                <li><Link href="/open-trip">{t('nav.openTrip')}</Link></li>
                <li><Link href="/private-trip">{t('nav.privateTrip')}</Link></li>
                <li><Link href="/blog">{t('nav.blog')}</Link></li>
                <li><Link href="/privacy-policy">{t('nav.privacy')}</Link></li>
              </ul>
            </div>

            {/* Hubungi */}
            <div className={styles.col} suppressHydrationWarning>
              <h3 className={styles.colTitle}>Hubungi</h3>
              <ul className={styles.links}>
                <li>
                  <a href="https://instagram.com/agendain.id" target="_blank" rel="noopener noreferrer">
                    <Image src={InstagramIcon} width={18} height={18} alt="Instagram" className={styles.socialIcon} /> @agendain.id
                  </a>
                </li>
                <li>
                  <a href="https://youtube.com/@agendain" target="_blank" rel="noopener noreferrer">
                    <Image src={YoutubeIcon} width={18} height={18} alt="Youtube" className={styles.socialIcon} /> Youtube
                  </a>
                </li>
                <li>
                  <a href="https://twitter.com/agendain" target="_blank" rel="noopener noreferrer">
                    <Image src={TwitterIcon} width={18} height={18} alt="Twitter" className={styles.socialIcon} /> Twitter
                  </a>
                </li>
                <li>
                  <a href="mailto:info@agendain.com">
                    <Image src={MailIcon} width={18} height={18} alt="Mail" className={styles.socialIcon} /> info@agendain.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Payment Partners */}
            <div className={styles.col} suppressHydrationWarning>
              <h3 className={styles.colTitle}>Payment Partners</h3>
              <div className={styles.paymentGrid} suppressHydrationWarning>
                {['Visa', 'Mastercard', 'Maestro', 'Amex', 'G Pay', 'BCA', 'BNI', 'Mandiri'].map((name) => (
                  <div key={name} className={styles.paymentBadge} suppressHydrationWarning>
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
