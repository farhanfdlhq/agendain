'use client'
import Link from 'next/link'
import { useState } from 'react'
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
        <ul className={`${styles.links} ${open ? styles.open : ''}`}>
          {links.map(l => (
            <li key={l.href}><Link href={l.href} className={styles.link} onClick={() => setOpen(false)}>{l.label}</Link></li>
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
        <button className={styles.burger} onClick={() => setOpen(!open)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>
    </header>
  )
}
