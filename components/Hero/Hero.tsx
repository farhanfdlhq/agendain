import Image from 'next/image'
import SearchBar from '../SearchBar/SearchBar'
import styles from './Hero.module.css'
import FadeIn from '../Motion/FadeIn'
import { ChevronDown } from 'lucide-react'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.imageWrapper}>
        <Image 
          src="https://images.unsplash.com/photo-1515542622106-78b28af7815d?q=80&w=2070&auto=format&fit=crop"
          alt="Eropa"
          fill
          priority
          className={styles.image}
        />
        <div className={styles.overlay} />
      </div>
      
      <div className={styles.content}>
        <FadeIn delay={0.2} direction="up">
          <h1 className={styles.title}>Jelajahi Eropa Tanpa Beban</h1>
        </FadeIn>
        <FadeIn delay={0.4} direction="up">
          <p className={styles.subtitle}>
            Rencanakan perjalanan impian Anda bersama ahlinya. Transparan, terpercaya, dan berkesan.
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
