'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n/useTranslation'
import LanguageToggle from '@/components/LanguageToggle/LanguageToggle'
import { generateWhatsAppLink } from '@/lib/utils'
import styles from './Navbar.module.css'

export default function Navbar({ settings }: { settings?: any }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  const links = [
    { href: '/', label: t('nav.home') },
    { href: '/tentang', label: t('nav.about') },
    { href: '/open-trip', label: t('nav.openTrip') },
    { href: '/private-trip', label: t('nav.privateTrip') },
    { href: '/blog', label: t('nav.blog') },
    { href: '/privacy-policy', label: t('nav.privacy') },
  ]
  
  // Track scroll for navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => { document.body.style.overflow = 'auto' }
  }, [open])

  const siteName = settings?.site_name || "agendain"
  const siteLogo = settings?.site_logo && settings.site_logo !== "/logo.png" ? settings.site_logo : "/agendain.jpeg"

  const isHome = pathname === '/'

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''} ${isHome && !scrolled ? styles.headerTransparent : ''}`}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          {siteLogo ? (
            <div className={styles.logoImageContainer}>
              <img 
                src={siteLogo} 
                alt={siteName} 
                className={styles.logoImage} 
                style={{ '--logo-height': settings?.logo_height ? `${settings.logo_height}px` : undefined } as React.CSSProperties}
              />
            </div>
          ) : (
            <span className={styles.logoText}>{siteName}</span>
          )}
        </Link>
        
        {/* Desktop Links */}
        <ul className={styles.desktopLinks}>
          {links.map(l => (
            <li key={l.href}>
              <Link href={l.href} className={`${styles.link} ${pathname === l.href ? styles.active : ''}`}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        
        <div className={styles.rightGroup}>
          <div className={styles.langToggleDesktop}>
            <LanguageToggle />
          </div>
          
          <a 
            href={generateWhatsAppLink(settings?.whatsapp_number, settings?.whatsapp_message)} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.cta}
          >
            {t('nav.cta')}
          </a>
        </div>
        
        <button className={`${styles.burger} ${open ? styles.burgerOpen : ''}`} onClick={() => setOpen(!open)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile Menu with Framer Motion */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div 
              className={styles.mobileBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div 
              className={styles.mobileNav}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            >
              <ul className={styles.mobileLinks}>
                {links.map((l, i) => (
                  <motion.li 
                    key={l.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Link href={l.href} className={`${styles.mobileLink} ${pathname === l.href ? styles.mobileActive : ''}`} onClick={() => setOpen(false)}>
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              
              <motion.div 
                className={styles.mobileCtaWrapper}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className={styles.mobileLangToggle}>
                  <LanguageToggle />
                </div>
                <a 
                  href={generateWhatsAppLink(settings?.whatsapp_number, settings?.whatsapp_message)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.mobileCta}
                >
                  {t('nav.cta')}
                </a>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
