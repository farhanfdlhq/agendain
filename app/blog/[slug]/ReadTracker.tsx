'use client'

import { useEffect } from 'react'
import { READ_DWELL_MS, READ_SCROLL_RATIO, readRecently } from '@/lib/blog-reads'

/**
 * Mencatat satu "baca" saat pengunjung bertahan READ_DWELL_MS (hanya selama
 * tab terlihat) ATAU menggulir sampai separuh artikel — mana yang lebih dulu.
 * Sekali per browser per 24 jam (localStorage); server juga men-dedupe per IP.
 * Tidak merender apa pun.
 */
export default function ReadTracker({ slug, targetId }: { slug: string; targetId: string }) {
  useEffect(() => {
    const key = `agendain_read_${slug}`
    try {
      if (readRecently(localStorage.getItem(key), Date.now())) return
    } catch {
      // localStorage diblokir (mode privat ketat) → tetap hitung; server men-dedupe.
    }

    let done = false
    let visibleMs = 0
    let frame = 0

    const record = () => {
      if (done) return
      done = true
      cleanup()
      try {
        localStorage.setItem(key, String(Date.now()))
      } catch {}
      fetch(`/api/blog/${encodeURIComponent(slug)}/read`, { method: 'POST', keepalive: true }).catch(() => {})
    }

    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      visibleMs += 1000
      if (visibleMs >= READ_DWELL_MS) record()
    }, 1000)

    const check = () => {
      frame = 0
      const el = document.getElementById(targetId)
      if (!el) return
      const rect = el.getBoundingClientRect()
      // Bagian artikel yang sudah lewat di atas tepi bawah layar.
      if (rect.height > 0 && (window.innerHeight - rect.top) / rect.height >= READ_SCROLL_RATIO) record()
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    function cleanup() {
      window.clearInterval(timer)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
    return cleanup
  }, [slug, targetId])

  return null
}
