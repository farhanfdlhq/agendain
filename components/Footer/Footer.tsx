'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Globe, Link2, MessageCircle, Music2, Phone } from 'lucide-react'
import InstagramIcon from '@/components/icons/mdi_instagram.svg'
import YoutubeIcon from '@/components/icons/mdi_youtube.svg'
import TwitterIcon from '@/components/icons/mdi_twitter.svg'
import MailIcon from '@/components/icons/ic_baseline-email.svg'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { parseFooterSettings, safeHref, type FooterSocial } from '@/lib/footer-settings'
import styles from './Footer.module.css'

const SVG_ICONS: Record<string, any> = {
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  twitter: TwitterIcon,
  email: MailIcon,
}

// Platform tanpa aset SVG sendiri memakai lucide agar tetap ada ikonnya.
// lucide tidak lagi menyediakan ikon merek, jadi dipakai padanan generik.
const LUCIDE_ICONS: Record<string, any> = {
  facebook: Globe,
  whatsapp: MessageCircle,
  tiktok: Music2,
  phone: Phone,
  link: Link2,
}

function SocialIcon({ platform }: { platform: string }) {
  const svg = SVG_ICONS[platform]
  if (svg) {
    return <Image src={svg} width={18} height={18} alt="" className={styles.socialIcon} />
  }
  const Lucide = LUCIDE_ICONS[platform] || Link2
  return <Lucide size={18} className={styles.socialIcon} aria-hidden="true" />
}

export default function Footer({ settings }: { settings?: any }) {
  const { t, locale } = useTranslation()
  const siteName = settings?.site_name || "agendain"
  const siteLogo = settings?.site_logo && settings.site_logo !== "/logo.png" ? settings.site_logo : "/agendain.jpeg"

  // Isi footer dari CMS (`footer_settings`). Key ini otomatis ikut di prop
  // `settings` karena getSettings() memakai prisma.setting.findMany().
  const footer = parseFooterSettings(settings?.footer_settings)
  const isEn = locale === 'en'
  const fs = (key: string): string =>
    ((isEn ? (footer.raw[`${key}_en`] || footer.raw[key]) : footer.raw[key]) || '').toString().trim()

  const tagline = fs('tagline') || t('footer.tagline') || 'Mau Jalan tapi Wacana Doang? <strong>Agendain aja!</strong>'
  const menuTitle = fs('menuTitle') || t('footer.mainMenu') || 'Navigasi'
  const contactTitle = fs('contactTitle') || t('footer.contact')
  const paymentTitle = fs('paymentTitle') || 'Payment Partners'
  const copyright = fs('copyright') || t('footer.copyright')

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
            {/* Tagline boleh memuat <strong>. Sudah dibersihkan saat disimpan
                di POST /api/settings/footer, jadi DOMPurify tidak perlu ikut
                ke bundle client yang dipakai semua halaman. */}
            <p className={styles.topBandTagline} dangerouslySetInnerHTML={{ __html: tagline }} />
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className={styles.mainFooter} suppressHydrationWarning>
        <div className={styles.container} suppressHydrationWarning>
          <div className={styles.columns} suppressHydrationWarning>
            {/* Navigasi — sengaja tetap otomatis, tidak dikelola CMS */}
            <div className={styles.col} suppressHydrationWarning>
              <h3 className={styles.colTitle}>{menuTitle}</h3>
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
              <h3 className={styles.colTitle}>{contactTitle}</h3>
              <ul className={styles.links}>
                {footer.socials.map((social: FooterSocial, i: number) => {
                  const href = safeHref(social.url)
                  const isExternal = /^https?:/i.test(href)
                  return (
                    <li key={`${social.platform}-${i}`}>
                      <a
                        href={href}
                        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      >
                        <SocialIcon platform={social.platform} /> {social.label || social.platform}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Payment Partners */}
            <div className={styles.col} suppressHydrationWarning>
              <h3 className={styles.colTitle}>{paymentTitle}</h3>
              <div className={styles.paymentGrid} suppressHydrationWarning>
                {footer.paymentBadges.map((name: string, i: number) => (
                  <div key={`${name}-${i}`} className={styles.paymentBadge} suppressHydrationWarning>
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
          <p>&copy; {new Date().getFullYear()} {siteName}. {copyright}</p>
        </div>
      </div>
    </footer>
  )
}
