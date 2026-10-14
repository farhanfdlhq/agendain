"use client"

import { useEffect, useRef } from "react"
import styles from "./ReadingProgress.module.css"

/**
 * Bar tipis progres baca di atas navbar (skill scroll-patterns §5).
 *
 * Mengikuti badan artikel saja (bukan seluruh halaman — artikel terkait &
 * footer tidak dihitung): 0% saat awal artikel menyentuh atas layar, 100% saat
 * akhir artikel menyentuh bawah layar. Pemanggil memberi elemen artikel
 * `view-timeline: --article block` dan leluhur bersamanya `timeline-scope: --article`.
 *
 * Browser dengan CSS scroll-driven animation: murni CSS, tanpa JS per scroll.
 * Lainnya (mis. Firefox): satu listener scroll pasif, diperbarui per frame.
 */
export default function ReadingProgress({ targetId }: { targetId: string }) {
  const barRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (CSS.supports("animation-timeline: view()")) return
    const bar = barRef.current
    const target = document.getElementById(targetId)
    if (!bar || !target) return

    let frame = 0
    const update = () => {
      frame = 0
      const rect = target.getBoundingClientRect()
      const span = rect.height - window.innerHeight
      const p = span > 0 ? -rect.top / span : rect.top <= 0 ? 1 : 0
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(frame)
    }
  }, [targetId])

  return (
    <div className={styles.track} aria-hidden="true">
      <span ref={barRef} className={styles.bar} />
    </div>
  )
}
