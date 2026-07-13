import React from 'react'
import styles from './HeroHeader.module.css'

interface HeroHeaderProps {
  title: React.ReactNode
  subtitle: React.ReactNode
  backgroundImage: string
  minHeight?: string
  paddingBottom?: string
}

export default function HeroHeader({ 
  title, 
  subtitle, 
  backgroundImage,
  minHeight = '50vh',
  paddingBottom = '60px'
}: HeroHeaderProps) {
  return (
    <div 
      className={styles.hero} 
      style={{ 
        backgroundImage: `url('${backgroundImage}')`,
        minHeight,
        paddingBottom 
      }}
    >
      <div className={styles.heroOverlay} />
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>{title}</h1>
        <p className={styles.heroSubtitle}>{subtitle}</p>
      </div>
    </div>
  )
}
