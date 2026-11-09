'use client'

import { useEffect } from 'react'
import { readRecently } from '@/lib/blog-reads'

/**
 * Mencatat satu "baca" begitu artikel dibuka dan tab-nya terlihat. Artikel
 * yang dibuka di tab latar belakang baru dihitung saat tab itu dilihat, jadi
 * tab yang dibuka lalu ditutup tanpa dilihat tidak ikut. Sekali per browser
 * per 24 jam (localStorage); server juga men-dedupe per IP dan mengabaikan bot
 * serta admin yang login. Tidak merender apa pun.
 */
export default function ReadTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `agendain_read_${slug}`
    try {
      if (readRecently(localStorage.getItem(key), Date.now())) return
    } catch {
      // localStorage diblokir (mode privat ketat) → tetap hitung; server men-dedupe.
    }

    const record = () => {
      if (document.visibilityState !== 'visible') return
      document.removeEventListener('visibilitychange', record)
      try {
        localStorage.setItem(key, String(Date.now()))
      } catch {}
      fetch(`/api/blog/${encodeURIComponent(slug)}/read`, { method: 'POST', keepalive: true }).catch(() => {})
    }

    if (document.visibilityState === 'visible') {
      record()
      return
    }
    document.addEventListener('visibilitychange', record)
    return () => document.removeEventListener('visibilitychange', record)
  }, [slug])

  return null
}
