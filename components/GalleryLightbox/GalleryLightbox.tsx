'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Grid } from 'lucide-react'
import styles from './GalleryLightbox.module.css'

export default function GalleryLightbox({ images, title }: { images: string[], title: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Ensure we have at least 5 images for the grid to look good, by repeating if necessary
  const displayImages = images.length > 0 ? images : ['/placeholder.jpg']
  while (displayImages.length < 5 && images.length > 0) {
    displayImages.push(images[displayImages.length % images.length])
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setIsOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setIsOpen(false)
    document.body.style.overflow = 'auto'
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex(prev => (prev === 0 ? displayImages.length - 1 : prev - 1))
  }

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex(prev => (prev === displayImages.length - 1 ? 0 : prev + 1))
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') setCurrentIndex(prev => (prev === 0 ? displayImages.length - 1 : prev - 1))
      if (e.key === 'ArrowRight') setCurrentIndex(prev => (prev === displayImages.length - 1 ? 0 : prev + 1))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, displayImages.length])

  const mainImage = displayImages[0]
  const subImages = displayImages.slice(1, 5)
  const totalImages = displayImages.length

  return (
    <>
      <div className={styles.galleryContainer}>
        <div className={styles.mainPhoto} onClick={() => openLightbox(0)}>
          <Image src={mainImage} alt={title} fill className={styles.img} priority sizes="(max-width: 768px) 100vw, 60vw" />
        </div>
        <div className={styles.subPhotos}>
          {subImages.map((src, i) => (
            <div key={i} className={styles.photoWrap} onClick={() => openLightbox(i + 1)}>
              <Image src={src} alt={`${title} ${i+1}`} fill className={styles.img} sizes="(max-width: 768px) 50vw, 20vw" />
              {i === 3 && totalImages > 5 && (
                <div className={styles.moreOverlay}>
                  <Grid className={styles.gridIcon} size={20} />
                  <span>Lihat Semua ({totalImages})</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isOpen && (
        <div className={styles.lightboxOverlay} onClick={closeLightbox}>
          <button className={styles.closeBtn} onClick={closeLightbox}>
            <X size={28} />
          </button>
          
          <button className={styles.navBtnLeft} onClick={prevImage}>
            <ChevronLeft size={36} />
          </button>
          
          <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
            <div className={styles.lightboxImgWrap}>
              <Image 
                src={displayImages[currentIndex]} 
                alt={`${title} ${currentIndex}`} 
                fill 
                className={styles.lightboxImg}
                sizes="100vw"
                quality={100}
              />
            </div>
            <div className={styles.counter}>
              {currentIndex + 1} / {totalImages}
            </div>
          </div>

          <button className={styles.navBtnRight} onClick={nextImage}>
            <ChevronRight size={36} />
          </button>
        </div>
      )}
    </>
  )
}
