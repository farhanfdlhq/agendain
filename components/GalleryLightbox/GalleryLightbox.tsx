'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react'
import styles from './GalleryLightbox.module.css'

/**
 * Galeri open trip.
 *
 * Prinsip desain (mengikuti .agents/skills/antislop-ui & antislop-layoutmobile):
 * - Aspect-ratio kontainer dijaga (16:9) supaya poster/foto TIDAK terpotong —
 *   masalah lama: banner 16:9 dipaksa ke kotak 2.4:1 dengan object-fit:cover.
 * - Motion secukupnya: hanya zoom halus saat hover (bukan loop tanpa henti).
 * - Aksen di momen kunci saja (tombol "Lihat semua", thumbnail aktif).
 * - Target sentuh ≥44px, thumbnail bisa difokus keyboard, lightbox punya
 *   filmstrip + navigasi panah/Escape.
 * - Layout beradaptasi ke jumlah foto, bukan menduplikasi jadi 5.
 */
export default function GalleryLightbox({ images, title }: { images: string[]; title: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const thumbStripRef = useRef<HTMLDivElement>(null)

  const pics = images.length > 0 ? images : ['/placeholder.webp']
  const total = pics.length

  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index)
    setIsOpen(true)
    document.body.style.overflow = 'hidden'
  }, [])

  const closeLightbox = useCallback(() => {
    setIsOpen(false)
    // Dihapus, bukan diisi 'auto' — `overflow:auto` yang tertinggal di <body>
    // mematikan position:sticky di seluruh situs (lihat Navbar.tsx).
    document.body.style.removeProperty('overflow')
  }, [])

  const go = useCallback(
    (dir: 1 | -1) => setCurrentIndex((prev) => (prev + dir + total) % total),
    [total],
  )

  // Navigasi keyboard saat lightbox terbuka.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, go, closeLightbox])

  // Jaga agar thumbnail aktif tetap terlihat di filmstrip.
  useEffect(() => {
    if (!isOpen || !thumbStripRef.current) return
    const active = thumbStripRef.current.querySelector<HTMLElement>('[data-active="true"]')
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [currentIndex, isOpen])

  // Bila komponen dilepas saat lightbox terbuka, jangan tinggalkan body terkunci.
  useEffect(() => () => { document.body.style.removeProperty('overflow') }, [])

  const subImages = pics.slice(1, 5)
  const extra = total - 5 // sisa foto di balik tombol "Lihat semua"

  return (
    <>
      <figure
        className={styles.gallery}
        data-count={Math.min(total, 5)}
        aria-label={`Galeri foto ${title}, ${total} foto`}
      >
        <button
          type="button"
          className={styles.mainTile}
          onClick={() => openLightbox(0)}
          aria-label={`Buka foto 1 dari ${total}`}
        >
          <Image
            src={pics[0]}
            alt={title}
            fill
            priority
            className={styles.img}
            sizes="(max-width: 768px) 100vw, 60vw"
          />
        </button>

        {subImages.length > 0 && (
          <div className={styles.subGrid}>
            {subImages.map((src, i) => {
              const isLast = i === subImages.length - 1
              const showMore = isLast && extra > 0
              return (
                <button
                  type="button"
                  key={i}
                  className={styles.subTile}
                  onClick={() => openLightbox(i + 1)}
                  aria-label={showMore ? `Lihat semua ${total} foto` : `Buka foto ${i + 2} dari ${total}`}
                >
                  <Image
                    src={src}
                    alt={`${title} — foto ${i + 2}`}
                    fill
                    className={styles.img}
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                  {showMore && (
                    <span className={styles.moreOverlay}>
                      <Images size={18} aria-hidden="true" />
                      +{extra}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Tombol tunggal yang selalu jelas — bukan sekadar overlay hover. */}
        {total > 1 && (
          <button
            type="button"
            className={styles.viewAllBtn}
            onClick={() => openLightbox(0)}
          >
            <Images size={16} aria-hidden="true" />
            Lihat semua ({total})
          </button>
        )}
      </figure>

      {isOpen && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={`Foto ${title}`}>
          <div className={styles.lightboxBar}>
            <span className={styles.counter}>
              {currentIndex + 1} <span className={styles.counterSep}>/</span> {total}
            </span>
            <button type="button" className={styles.iconBtn} onClick={closeLightbox} aria-label="Tutup galeri">
              <X size={22} />
            </button>
          </div>

          <div className={styles.stage} onClick={closeLightbox}>
            {total > 1 && (
              <button
                type="button"
                className={`${styles.navBtn} ${styles.navPrev}`}
                onClick={(e) => { e.stopPropagation(); go(-1) }}
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            <div className={styles.stageImgWrap} onClick={(e) => e.stopPropagation()}>
              {/* object-fit: contain di lightbox → foto/poster utuh, tak terpotong. */}
              <Image
                src={pics[currentIndex]}
                alt={`${title} — foto ${currentIndex + 1}`}
                fill
                // Inline agar pasti menang: foto/poster tampil utuh, tidak
                // gepeng maupun terpotong, apa pun rasionya.
                style={{ objectFit: 'contain' }}
                sizes="100vw"
                quality={90}
              />
            </div>

            {total > 1 && (
              <button
                type="button"
                className={`${styles.navBtn} ${styles.navNext}`}
                onClick={(e) => { e.stopPropagation(); go(1) }}
                aria-label="Foto berikutnya"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>

          {total > 1 && (
            <div className={styles.filmstrip} ref={thumbStripRef}>
              {pics.map((src, i) => (
                <button
                  type="button"
                  key={i}
                  data-active={i === currentIndex}
                  className={styles.filmThumb}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Ke foto ${i + 1}`}
                  aria-current={i === currentIndex}
                >
                  <Image src={src} alt="" fill className={styles.img} sizes="84px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
