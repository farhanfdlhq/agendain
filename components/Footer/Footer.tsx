'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Globe, Link2, Mail, MessageCircle, Music2, Phone } from 'lucide-react'
import InstagramIcon from '@/components/icons/mdi_instagram.svg'
import YoutubeIcon from '@/components/icons/mdi_youtube.svg'
import TwitterIcon from '@/components/icons/mdi_twitter.svg'
import ThreadsIcon from '@/components/icons/threads.svg'
import MailIcon from '@/components/icons/ic_baseline-email.svg'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { FOOTER_SOCIAL_PLATFORMS, parseFooterSettings, safeHref } from '@/lib/footer-settings'
import { formatWhatsAppNumber } from '@/lib/utils'
import { sanitizeHtml } from '@/lib/sanitize'
import styles from './Footer.module.css'

const SVG_ICONS: Record<string, any> = {
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  twitter: TwitterIcon,
  threads: ThreadsIcon,
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

// Platform "kontak" tampil sebagai baris ikon+label+nilai di kolom Hubungi;
// sisanya (sosial media) jadi tombol ikon bulat di baris atas footer.
const CONTACT_PLATFORMS = new Set(['email', 'whatsapp', 'phone'])
const CONTACT_ICONS: Record<string, any> = { email: Mail, whatsapp: MessageCircle, phone: Phone }

// 6281995264565 → 0819-9526-4565 (tampilan saja; tautan tetap wa.me/62…).
function displayPhone(num: string): string {
  const local = num.startsWith('62') ? `0${num.slice(2)}` : num
  return local.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3')
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

  const eyebrow = fs('eyebrow') || t('footer.eyebrow')
  const tagline = fs('tagline') || t('footer.tagline') || 'Mau Jalan tapi Wacana Doang? <strong>Agendain aja!</strong>'
  const desc = fs('desc') || t('footer.desc')
  const menuTitle = fs('menuTitle') || t('footer.mainMenu') || 'Navigasi'
  const contactTitle = fs('contactTitle') || t('footer.contact')
  const paymentTitle = fs('paymentTitle') || 'Payment Partners'
  const copyright = fs('copyright') || t('footer.copyright')

  // Nomor dari Pengaturan → Umum. Kosong = tombol & baris WhatsApp disembunyikan (tanpa nomor contoh).
  const waNumber = formatWhatsAppNumber(settings?.whatsapp_number)
  const waLabel = fs('waButton') || t('footer.chatWa')
  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(isEn ? 'Hi Agendain! I have a question.' : 'Halo Agendain! Saya mau tanya-tanya nih.')}`

  const socialLinks = footer.socials.filter((s) => !CONTACT_PLATFORMS.has(s.platform))
  const contacts = footer.socials.filter((s) => CONTACT_PLATFORMS.has(s.platform))
  // WhatsApp selalu ada di kolom kontak (nomor dari Pengaturan) bila CMS belum mencantumkannya.
  if (waNumber && !contacts.some((c) => c.platform === 'whatsapp')) {
    contacts.unshift({ platform: 'whatsapp', label: displayPhone(waNumber), url: waHref })
  }
  const platformLabel = (id: string) => FOOTER_SOCIAL_PLATFORMS.find((p) => p.id === id)?.label || id

  return (
    <footer className={styles.footer} suppressHydrationWarning>
      <div className={styles.container}>
        {/* Baris atas: logo kiri, sosial media kanan */}
        <div className={styles.topRow}>
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
          {socialLinks.length > 0 && (
            <ul className={styles.socials}>
              {socialLinks.map((social, i) => {
                const href = safeHref(social.url)
                const isExternal = /^https?:/i.test(href)
                return (
                  <li key={`${social.platform}-${i}`}>
                    <a
                      href={href}
                      className={styles.socialBtn}
                      aria-label={platformLabel(social.platform)}
                      title={social.label || platformLabel(social.platform)}
                      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      <SocialIcon platform={social.platform} />
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className={styles.columns}>
          {/* Brand: eyebrow, tagline, deskripsi, CTA WhatsApp */}
          <div className={styles.brandCol}>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            {/* Tagline boleh memuat <strong>. Sudah disanitasi saat disimpan
                (POST /api/settings/footer); sanitasi ringan saat render menutup
                risiko jalur tulis lain. sanitizeHtml MURNI (regex, tanpa
                DOMPurify) → tak menambah beban bundle client. */}
            <p className={styles.tagline} dangerouslySetInnerHTML={{ __html: sanitizeHtml(tagline) }} />
            {desc && <p className={styles.desc}>{desc}</p>}
            {waNumber && (
              <a href={waHref} target="_blank" rel="noopener noreferrer" className={styles.waBtn}>
                <MessageCircle size={18} aria-hidden="true" />
                <span>{waLabel} · {displayPhone(waNumber)}</span>
              </a>
            )}
          </div>

          {/* Navigasi — sengaja tetap otomatis, tidak dikelola CMS */}
          <nav className={styles.col} aria-label={menuTitle}>
            <h3 className={styles.colTitle}>{menuTitle}</h3>
            <ul className={styles.links}>
              <li><Link href="/">{t('nav.home')}</Link></li>
              <li><Link href="/tentang">{t('nav.about')}</Link></li>
              <li><Link href="/open-trip">{t('nav.openTrip')}</Link></li>
              <li><Link href="/private-trip">{t('nav.privateTrip')}</Link></li>
              <li><Link href="/blog">{t('nav.blog')}</Link></li>
            </ul>
          </nav>

          {/* Hubungi */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>{contactTitle}</h3>
            <ul className={styles.contactList}>
              {contacts.map((c, i) => {
                const href = safeHref(c.url)
                const isExternal = /^https?:/i.test(href)
                const Icon = CONTACT_ICONS[c.platform] || Link2
                return (
                  <li key={`${c.platform}-${i}`}>
                    <a href={href} className={styles.contactItem} {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                      <span className={styles.contactIcon}><Icon size={16} aria-hidden="true" /></span>
                      <span className={styles.contactText}>
                        <span className={styles.contactLabel}>{platformLabel(c.platform)}</span>
                        <span className={styles.contactValue}>{c.label || href.replace(/^(mailto:|tel:)/, '')}</span>
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* Mitra pembayaran */}
        <div className={styles.paymentRow}>
          <span className={styles.paymentTitle}>{paymentTitle}</span>
          <ul className={styles.paymentList}>
            {footer.paymentBadges.map((name: string, i: number) => (
              <li key={`${name}-${i}`} className={styles.paymentBadge}>{name}</li>
            ))}
          </ul>
        </div>

        {/* Bawah: copyright kiri, tautan legal kanan */}
        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} {siteName}. {copyright}</p>
          <Link href="/privacy-policy" className={styles.bottomLink}>{t('nav.privacy')}</Link>
        </div>
      </div>
    </footer>
  )
}
