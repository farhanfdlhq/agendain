import React from 'react'
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
        backgroundImage: `url('${backgroundImage}')`,
        minHeight,
        paddingBottom 
      }}
    >
      <div className={styles.heroOverlay} />
      <div className={styles.heroContent} style={{ textAlign, alignItems: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center' }}>
        <h1 className={styles.heroTitle}>{title}</h1>
        {subtitle && <p className={styles.heroSubtitle}>{subtitle}</p>}
        {children}
      </div>
    </div>
  )
}
