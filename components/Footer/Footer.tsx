'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Globe, Link2, Mail, MessageCircle, Music2, Phone } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { FOOTER_SOCIAL_PLATFORMS, parseFooterSettings, safeHref, taglineToHtml } from '@/lib/footer-settings'
import { formatWhatsAppNumber } from '@/lib/utils'
import { sanitizeHtml } from '@/lib/sanitize'
import { fontStyleFrom } from '@/lib/font-style'
import styles from './Footer.module.css'
import { siteLogoOr } from "@/lib/site-logo"

const INLINE_SVGS: Record<string, (props: { className?: string }) => React.ReactElement> = {
  instagram: ({ className }) => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M7.8 2H16.2C19.4 2 22 4.6 22 7.8V16.2C22 17.7383 21.3889 19.2135 20.3012 20.3012C19.2135 21.3889 17.7383 22 16.2 22H7.8C4.6 22 2 19.4 2 16.2V7.8C2 6.26174 2.61107 4.78649 3.69878 3.69878C4.78649 2.61107 6.26174 2 7.8 2ZM7.6 4C6.64522 4 5.72955 4.37928 5.05442 5.05442C4.37928 5.72955 4 6.64522 4 7.6V16.4C4 18.39 5.61 20 7.6 20H16.4C17.3548 20 18.2705 19.6207 18.9456 18.9456C19.6207 18.2705 20 17.3548 20 16.4V7.6C20 5.61 18.39 4 16.4 4H7.6ZM17.25 5.5C17.5815 5.5 17.8995 5.6317 18.1339 5.86612C18.3683 6.10054 18.5 6.41848 18.5 6.75C18.5 7.08152 18.3683 7.39946 18.1339 7.63388C17.8995 7.8683 17.5815 8 17.25 8C16.9185 8 16.6005 7.8683 16.3661 7.63388C16.1317 7.39946 16 7.08152 16 6.75C16 6.41848 16.1317 6.10054 16.3661 5.86612C16.6005 5.6317 16.9185 5.5 17.25 5.5ZM12 7C13.3261 7 14.5979 7.52678 15.5355 8.46447C16.4732 9.40215 17 10.6739 17 12C17 13.3261 16.4732 14.5979 15.5355 15.5355C14.5979 16.4732 13.3261 17 12 17C10.6739 17 9.40215 16.4732 8.46447 15.5355C7.52678 14.5979 7 13.3261 7 12C7 10.6739 7.52678 9.40215 8.46447 8.46447C9.40215 7.52678 10.6739 7 12 7ZM12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9Z" />
    </svg>
  ),
  youtube: ({ className }) => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M10 15L15.19 12L10 9V15ZM21.56 7.17C21.69 7.64 21.78 8.27 21.84 9.07C21.91 9.87 21.94 10.56 21.94 11.16L22 12C22 14.19 21.84 15.8 21.56 16.83C21.31 17.73 20.73 18.31 19.83 18.56C19.36 18.69 18.5 18.78 17.18 18.84C15.88 18.91 14.69 18.94 13.59 18.94L12 19C7.81 19 5.2 18.84 4.17 18.56C3.27 18.31 2.69 17.73 2.44 16.83C2.31 16.36 2.22 15.73 2.16 14.93C2.09 14.13 2.06 13.44 2.06 12.84L2 12C2 9.81 2.16 8.2 2.44 7.17C2.69 6.27 3.27 5.69 4.17 5.44C4.64 5.31 5.5 5.22 6.82 5.16C8.12 5.09 9.31 5.06 10.41 5.06L12 5C16.19 5 18.8 5.16 19.83 5.44C20.73 5.69 21.31 6.27 21.56 7.17Z" />
    </svg>
  ),
  twitter: ({ className }) => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22.46 6C21.69 6.35 20.86 6.58 20 6.69C20.88 6.16 21.56 5.32 21.88 4.31C21.05 4.81 20.13 5.16 19.16 5.36C18.37 4.5 17.26 4 16 4C13.65 4 11.73 5.92 11.73 8.29C11.73 8.63 11.77 8.96 11.84 9.27C8.28004 9.09 5.11004 7.38 3.00004 4.79C2.63004 5.42 2.42004 6.16 2.42004 6.94C2.42004 8.43 3.17004 9.75 4.33004 10.5C3.62004 10.5 2.96004 10.3 2.38004 10V10.03C2.38004 12.11 3.86004 13.85 5.82004 14.24C5.19088 14.4129 4.53008 14.4369 3.89004 14.31C4.16165 15.1625 4.69358 15.9084 5.41106 16.4429C6.12854 16.9775 6.99549 17.2737 7.89004 17.29C6.37371 18.4905 4.49405 19.1394 2.56004 19.13C2.22004 19.13 1.88004 19.11 1.54004 19.07C3.44004 20.29 5.70004 21 8.12004 21C16 21 20.33 14.46 20.33 8.79C20.33 8.6 20.33 8.42 20.32 8.23C21.16 7.63 21.88 6.87 22.46 6Z" />
    </svg>
  ),
  threads: ({ className }) => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.36-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 013.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 00-2.215-.22z" />
    </svg>
  ),
  email: ({ className }) => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" />
    </svg>
  ),
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
  const InlineSvg = INLINE_SVGS[platform]
  if (InlineSvg) {
    return <InlineSvg className={styles.socialIcon} />
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
  const siteLogo = siteLogoOr(settings?.site_logo)

  // Isi footer dari CMS (`footer_settings`). Key ini otomatis ikut di prop
  // `settings` karena getSettings() memakai prisma.setting.findMany().
  const footer = parseFooterSettings(settings?.footer_settings)
  const isEn = locale === 'en'
  const fs = (key: string): string =>
    ((isEn ? (footer.raw[`${key}_en`] || footer.raw[key]) : footer.raw[key]) || '').toString().trim()

  const eyebrow = fs('eyebrow') || t('footer.eyebrow')
  // `*teks*` = kata kuning (sama dengan CMS lain); `<strong>` lama tetap didukung.
  const tagline = taglineToHtml(fs('tagline') || t('footer.tagline') || 'Mau Jalan tapi Wacana Doang? *Agendain aja!*')
  const desc = fs('desc') || t('footer.desc')
  const menuTitle = fs('menuTitle') || t('footer.mainMenu') || 'Navigasi'
  const contactTitle = fs('contactTitle') || t('footer.contact')
  const paymentTitle = fs('paymentTitle') || 'Payment Partners'
  const copyright = fs('copyright') || t('footer.copyright')
  // Font Weight/Size dari CMS Footer (berlaku ID & EN); kosong = gaya bawaan.
  const fst = (key: string) => fontStyleFrom(footer.raw[`${key}Weight`], footer.raw[`${key}Size`])

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
                width={160}
                height={settings?.logo_height ? Number(settings.logo_height) : 42}
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
            {eyebrow && <p className={styles.eyebrow} style={fst('eyebrow')}>{eyebrow}</p>}
            {/* Tagline boleh memuat <strong>. Sudah disanitasi saat disimpan
                (POST /api/settings/footer); sanitasi ringan saat render menutup
                risiko jalur tulis lain. sanitizeHtml MURNI (regex, tanpa
                DOMPurify) → tak menambah beban bundle client. */}
            <p className={styles.tagline} style={fst('tagline')} dangerouslySetInnerHTML={{ __html: sanitizeHtml(tagline) }} />
            {desc && <p className={styles.desc} style={fst('desc')}>{desc}</p>}
            {waNumber && (
              <a href={waHref} target="_blank" rel="noopener noreferrer" className={styles.waBtn}>
                <MessageCircle size={18} aria-hidden="true" />
                <span style={fst('waButton')}>{waLabel} · {displayPhone(waNumber)}</span>
              </a>
            )}
          </div>

          {/* Navigasi — sengaja tetap otomatis, tidak dikelola CMS */}
          <nav className={styles.col} aria-label={menuTitle}>
            <h3 className={styles.colTitle} style={fst('menuTitle')}>{menuTitle}</h3>
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
            <h3 className={styles.colTitle} style={fst('contactTitle')}>{contactTitle}</h3>
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
          <span className={styles.paymentTitle} style={fst('paymentTitle')}>{paymentTitle}</span>
          <ul className={styles.paymentList}>
            {footer.paymentBadges.map((name: string, i: number) => (
              <li key={`${name}-${i}`} className={styles.paymentBadge}>{name}</li>
            ))}
          </ul>
        </div>

        {/* Bawah: copyright kiri, tautan legal kanan */}
        <div className={styles.bottom}>
          <p style={fst('copyright')}>&copy; {new Date().getFullYear()} {siteName}. {copyright}</p>
          <Link href="/privacy-policy" className={styles.bottomLink}>{t('nav.privacy')}</Link>
        </div>
      </div>
    </footer>
  )
}
