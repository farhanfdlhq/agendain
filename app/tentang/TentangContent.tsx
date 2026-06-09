'use client'
import Image from 'next/image'
import styles from './page.module.css'
import { Shield, Target, Heart, Award } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function TentangContent() {
  const { t } = useTranslation()

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <Image 
          src="https://images.unsplash.com/photo-1522083165195-3444ced7e363?q=80&w=2070&auto=format&fit=crop" 
          alt="Tentang Agendain" 
          fill 
          priority 
          className={styles.heroImage} 
        />
        <div className={styles.overlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.title}>{t('about.title')}</h1>
          <p className={styles.subtitle}>{t('about.subtitle')}</p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.storySection}>
          <div className={styles.storyText}>
            <h2 className={styles.sectionTitle}>{t('about.story')}</h2>
            <p className={styles.paragraph}>
              {t('about.storyP1')}
            </p>
            <p className={styles.paragraph}>
              {t('about.storyP2')}
            </p>
          </div>
          <div className={styles.storyImageWrapper}>
            <Image 
              src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop"
              alt="Perjalanan Eropa"
              fill
              className={styles.storyImage}
            />
          </div>
        </div>

        <section className={styles.valuesSection}>
          <h2 className={styles.sectionTitle} style={{textAlign: 'center', marginBottom: '40px'}}>{t('about.values')}</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.iconWrapper}>
                <Shield size={32} color="var(--color-primary)" />
              </div>
              <h3 className={styles.valueTitle}>{t('about.security')}</h3>
              <p className={styles.valueDesc}>{t('about.securityDesc')}</p>
            </div>
            
            <div className={styles.valueCard}>
              <div className={styles.iconWrapper}>
                <Heart size={32} color="var(--color-primary)" />
              </div>
              <h3 className={styles.valueTitle}>{t('about.service')}</h3>
              <p className={styles.valueDesc}>{t('about.serviceDesc')}</p>
            </div>
            
            <div className={styles.valueCard}>
              <div className={styles.iconWrapper}>
                <Award size={32} color="var(--color-primary)" />
              </div>
              <h3 className={styles.valueTitle}>{t('about.quality')}</h3>
              <p className={styles.valueDesc}>{t('about.qualityDesc')}</p>
            </div>
            
            <div className={styles.valueCard}>
              <div className={styles.iconWrapper}>
                <Target size={32} color="var(--color-primary)" />
              </div>
              <h3 className={styles.valueTitle}>{t('about.itinerary')}</h3>
              <p className={styles.valueDesc}>{t('about.itineraryDesc')}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
