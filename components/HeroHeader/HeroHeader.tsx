import React from 'react'
import Image from 'next/image'
import styles from './HeroHeader.module.css'

interface HeroHeaderProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  backgroundImage: string
  minHeight?: string
  paddingBottom?: string
  children?: React.ReactNode
  textAlign?: 'left' | 'center' | 'right'
}

export default function HeroHeader({ 
  title, 
  subtitle, 
  backgroundImage,
  minHeight = '50vh',
  paddingBottom = '60px',
  children,
  textAlign = 'center'
}: HeroHeaderProps) {
  return (
    <div
      className={styles.hero}
      style={{
        minHeight,
        paddingBottom
      }}
    >
      {/* Sengaja next/image, bukan CSS background-image: hero ini full-bleed,
          jadi background biasa memaksa browser merentangkan satu file apa
          adanya tanpa srcset/DPR. Pola & angkanya disamakan dengan hero
          beranda (components/HomeContent/sections/HeroSection.tsx). */}
      <div className={styles.heroImageWrapper}>
        <Image src={backgroundImage} alt="" fill priority className={styles.heroImage} quality={85} sizes="100vw" />
      </div>
      <div className={styles.heroOverlay} />
      <div className={styles.heroContent} style={{ textAlign, alignItems: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center' }}>
        <h1 className={styles.heroTitle}>{title}</h1>
        {subtitle && <p className={styles.heroSubtitle}>{subtitle}</p>}
        {children}
      </div>
    </div>
  )
}
