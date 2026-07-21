'use client'

import PackageCard from '@/components/PackageCard/PackageCard'
import OpenTripFilter from '@/components/OpenTripFilter/OpenTripFilter'
import HeroHeader from '@/components/HeroHeader/HeroHeader'
import styles from './page.module.css'
import { useTranslation } from '@/lib/i18n/useTranslation'

interface OpenTripContentProps {
  packages: any[]
  destList: string[]
}

export default function OpenTripContent({ packages, destList }: OpenTripContentProps) {
  const { t } = useTranslation()

  return (
    <div className={styles.page}>
      <div className={styles.heroContainer}>
        <div className={styles.heroWrapper}>
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              {t('openTrip.hero.title1')}<br />
              {t('openTrip.hero.title2')}<br />
              {t('openTrip.hero.title3')} <span className={styles.textGold}>Agendain.</span>
            </h1>
          </div>
        </div>
      </div>
      
      <div className={styles.statsWrapper}>
        <div className={styles.statsContainer}>
          <div className={styles.statBox}>
            <h4>2+</h4>
            <p>Pengalaman<br/>Bertahun-tahun</p>
          </div>
          <div className={styles.statBox}>
            <h4>63+</h4>
            <p>Destinasi Unik</p>
          </div>
          <div className={styles.statBox}>
            <h4>32K+</h4>
            <p>Traveler Senang</p>
          </div>
          <div className={styles.statBox}>
            <h4>94%</h4>
            <p>Traveler Senang</p>
          </div>
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.container}>
          
          <div className={styles.sectionHeader}>
            <p className={styles.sectionLabel}>{t('openTrip.section.label')}</p>
            <h2 className={styles.sectionTitle}>
              {t('openTrip.section.title1')}<br/>
              {t('openTrip.section.title2')}<br/>
              {t('openTrip.section.title3')}
            </h2>
          </div>

          <OpenTripFilter destList={destList} />
          
          <div className={styles.grid}>
            {packages.map(pkg => (
              <PackageCard key={pkg.id} {...pkg} />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.ctaBannerWrapper}>
        <div className={styles.ctaBanner}>
          <div className={styles.ctaContent}>
            <p className={styles.ctaLabel}>{t('openTrip.cta.label')}</p>
            <h2>{t('openTrip.cta.title1')}<br/>{t('openTrip.cta.title2')} <span className={styles.textGold}>500rb</span> {t('openTrip.cta.title3')}</h2>
            <p>{t('openTrip.cta.desc')}</p>
          </div>
          <div className={styles.ctaActions}>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              {t('openTrip.cta.btnPrimary')}
            </a>
            <a href="#jadwal" className={styles.btnSecondary}>{t('openTrip.cta.btnSecondary')} →</a>
          </div>
        </div>
      </div>

    </div>
  )
}
