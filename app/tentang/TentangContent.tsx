'use client'
import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'
import FadeIn from '@/components/Motion/FadeIn'
import Stagger from '@/components/Motion/Stagger'
import HeroHeader from '@/components/HeroHeader/HeroHeader'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function TentangContent() {
  const { t } = useTranslation()

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <HeroHeader 
        backgroundImage="/dest-swiss.webp"
        title={<>{t('about.new.heroTitleStart')} <span className={styles.textGold}>Agendain</span>{t('about.new.heroTitleEnd')}</>}
        subtitle={t('about.new.heroSubtitle')}
        minHeight="600px"
        paddingBottom="200px"
      />

      <div className={styles.container}>
        {/* Overlapping Mission Card */}
        <FadeIn direction="up" delay={0.2}>
          <div className={styles.missionCard}>
            <div className={styles.missionImageWrapper}>
              <div className={styles.missionImageInner}>
                <Image 
                  src="/dest-italy.webp" 
                  alt="Misi Agendain"
                  fill
                  style={{ objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
                  sizes="(max-width: 900px) 100vw, 50vw"
                />
              </div>
            </div>
            <div className={styles.missionText}>
              <h3 className={styles.missionLabel}>{t('about.new.missionLabel')}</h3>
              <h2 className={styles.missionTitle}>
                {t('about.new.missionTitle')}
              </h2>
              <p className={styles.missionDesc}>
                {t('about.new.missionDesc')}
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Articles Grid Section */}
        <div className={styles.articlesSection}>
          <Stagger staggerDelay={0.1}>
            <div className={styles.articleGrid}>
              {/* Article 1 */}
              <FadeIn direction="up" delay={0.3}>
                <div className={styles.articleCard}>
                  <div className={styles.articleImageWrapper}>
                    <Image 
                      src="/why-hotel.webp" 
                      alt="Gelato Roma"
                      fill
                      className={styles.articleImage}
                    />
                  </div>
                  <div className={styles.articleContent}>
                    <div className={styles.articleMeta}>
                      <span className={styles.metaDate}>
                        <span className={styles.bullet}>•</span> April 29, 2026
                      </span>
                      <span className={styles.metaCategory}>Italia, Kuliner</span>
                    </div>
                    <h3 className={styles.articleTitle}>Berburu Gelato Terenak di Roma yang Harganya Ramah Kantong</h3>
                    <p className={styles.articleExcerpt}>Jangan sampai kejebak kedai turis yang mahal. Ini bocoran gelateria autentik tersembunyi...</p>
                    <Link href="#" className={styles.readMoreBtn}>{t('about.new.readMore')}</Link>
                  </div>
                </div>
              </FadeIn>

              {/* Article 2 */}
              <FadeIn direction="up" delay={0.4}>
                <div className={styles.articleCard}>
                  <div className={styles.articleImageWrapper}>
                    <Image 
                      src="/dest-swiss.webp" 
                      alt="Keliling Milan"
                      fill
                      className={styles.articleImage}
                    />
                  </div>
                  <div className={styles.articleContent}>
                    <div className={styles.articleMeta}>
                      <span className={styles.metaDate}>
                        <span className={styles.bullet}>•</span> Juni 16, 2026
                      </span>
                      <span className={styles.metaCategory}>Italia, Tips</span>
                    </div>
                    <h3 className={styles.articleTitle}>Cara Jitu Keliling Milan 24 Jam Cuma Modal Google Maps</h3>
                    <p className={styles.articleExcerpt}>Punya waktu seharian doang di kota mode? Gak usah panik, ini contekan rute jalan kaki paling efisien...</p>
                    <Link href="#" className={styles.readMoreBtn}>{t('about.new.readMore')}</Link>
                  </div>
                </div>
              </FadeIn>
            </div>
          </Stagger>

          {/* Pagination */}
          <FadeIn direction="up" delay={0.5}>
            <div className={styles.pagination}>
              <button className={styles.pageBtnActive}>1</button>
              <button className={styles.pageBtn}>2</button>
              <span className={styles.pageDots}>...</span>
              <button className={styles.pageBtn}>&gt;&gt;</button>
            </div>
          </FadeIn>
        </div>

        {/* Lead Guide Section */}
        <FadeIn direction="up" delay={0.6}>
          <div className={styles.guideSection}>
            <div className={styles.guideContent}>
              <div className={styles.guidePill}>{t('about.new.guidePill')}</div>
              <h2 className={styles.guideTitle}>{t('about.new.guideTitle')}</h2>
              <p className={styles.guideDesc}>
                {t('about.new.guideDescP1')}<br/><br/>
                {t('about.new.guideDescP2')}
              </p>
              <Link href="/konsultasi" className={styles.guideBtn}>
                {t('about.new.guideBtn')}
              </Link>
            </div>
            <div className={styles.guideImageWrapper}>
              <div className={styles.guideImageInner}>
                <Image 
                  src="/why-camera.webp" 
                  alt="Lead Guide"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
