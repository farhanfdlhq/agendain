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

export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>Agendain</Link>
        <ul className={`${styles.links} ${open ? styles.open : ''}`}>
          {links.map(l => (
            <li key={l.href}><Link href={l.href} className={styles.link} onClick={() => setOpen(false)}>{l.label}</Link></li>
          ))}
        </ul>
        <Link href="/kontak" className={styles.cta}>Hubungi Kami</Link>
        <button className={styles.burger} onClick={() => setOpen(!open)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>
    </header>
  )
}
