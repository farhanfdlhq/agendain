import Image from 'next/image'
import SearchBar from '../SearchBar/SearchBar'
import styles from './Hero.module.css'
import FadeIn from '../Motion/FadeIn'
import { ChevronDown } from 'lucide-react'

export default function Hero({ 
  title = "Jelajahi Eropa Tanpa Beban",
  titleColor = "",
  subtitle = "Rencanakan perjalanan impian Anda bersama ahlinya. Transparan, terpercaya, dan berkesan.",
  subtitleColor = ""
}: { 
  title?: string, 
  titleColor?: string,
  subtitle?: string,
  subtitleColor?: string
}) {
  return (
    <section className={styles.hero}>
      <div className={styles.imageWrapper}>
        <Image 
          src="/placeholder.webp"
          alt="Eropa"
          fill
          priority
          className={styles.image}
         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/>
        <div className={styles.overlay} />
      </div>
      
      <div className={styles.content}>
        <FadeIn delay={0.2} direction="up">
          <h1 className={styles.title} style={titleColor ? { color: titleColor } : {}}>{title}</h1>
        </FadeIn>
        <FadeIn delay={0.4} direction="up">
          <p className={styles.subtitle} style={subtitleColor ? { color: subtitleColor } : {}}>
            {subtitle}
          </p>
        </FadeIn>
        
        <FadeIn delay={0.6} direction="up" className={styles.searchWrapper}>
          <SearchBar />
        </FadeIn>
      </div>

      <div className={styles.scrollIndicator}>
        <ChevronDown size={32} />
      </div>
    </section>
  )
}
