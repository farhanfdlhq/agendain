'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import styles from './Navbar.module.css'

const links = [
  { href: '/', label: 'Beranda' },
  { href: '/tentang', label: 'Tentang Kami' },
  { href: '/paket', label: 'Paket Wisata' },
  { href: '/private-trip', label: 'Private Trip' },
  { href: '/destinasi', label: 'Destinasi' },
]

export default function Navbar({ settings }: { settings?: any }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  
  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => { document.body.style.overflow = 'auto' }
  }, [open])

  const siteName = settings?.site_name || "Agendain"
  const siteLogo = settings?.site_logo && settings.site_logo !== "/logo.png" ? settings.site_logo : "/agendain.jpeg"

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          {siteLogo ? (
            <img src={siteLogo} alt={siteName} style={{ height: "40px", objectFit: "contain" }} />
          ) : (
            siteName
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
        
        <a 
          href={`https://wa.me/${settings?.whatsapp_number?.replace(/\D/g, '') || "6281234567890"}?text=${encodeURIComponent(settings?.whatsapp_message || "Halo, saya ingin bertanya mengenai paket wisata.")}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.cta}
        >
          Hubungi Kami
        </a>
        
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
                    <Link href={l.href} className={styles.mobileLink} onClick={() => setOpen(false)}>
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
                <a 
                  href={`https://wa.me/${settings?.whatsapp_number?.replace(/\D/g, '') || "6281234567890"}?text=${encodeURIComponent(settings?.whatsapp_message || "Halo, saya ingin bertanya mengenai paket wisata.")}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.mobileCta}
                >
                  Hubungi Kami
                </a>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
