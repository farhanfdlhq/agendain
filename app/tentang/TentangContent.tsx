'use client'
import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'
import FadeIn from '@/components/Motion/FadeIn'
import Stagger from '@/components/Motion/Stagger'
import HeroHeader from '@/components/HeroHeader/HeroHeader'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { parseGoldText } from '@/lib/utils/textFormatting'
import { sanitizeHtml } from '@/lib/sanitize'

export default function TentangContent({ aboutSettings = {} }: { aboutSettings?: any }) {
  const { t, locale } = useTranslation()
  const isEn = locale === 'en'
  const getSetting = (key: string) => {
    const val = isEn ? (aboutSettings[`${key}_en`] || aboutSettings[key]) : aboutSettings[key];
    return val;
  }

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <HeroHeader 
        backgroundImage={getSetting('heroImage') || "/dest-swiss.webp"}
        title={parseGoldText(getSetting('heroTitle') || (isEn ? 'What is *Agendain*?' : 'Apa itu *Agendain*?'), styles, getSetting('heroTitleWeight'))}
        subtitle={<span style={{ fontWeight: getSetting('heroSubtitleWeight') ? Number(getSetting('heroSubtitleWeight')) : undefined }}>{getSetting('heroSubtitle') || t('about.new.heroSubtitle')}</span>}
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
                  src={getSetting('missionImage') || "/dest-italy.webp"} 
                  alt="Misi Agendain"
                  fill
                  style={{ objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
                  sizes="(max-width: 900px) 100vw, 50vw"
                />
              </div>
            </div>
            <div className={styles.missionText}>
              <h3 className={styles.missionLabel} style={{ fontWeight: getSetting('missionLabelWeight') ? Number(getSetting('missionLabelWeight')) : undefined }}>
                {getSetting('missionLabel') || t('about.new.missionLabel')}
              </h3>
              <h2 className={styles.missionTitle} style={{ fontWeight: getSetting('missionTitleWeight') ? Number(getSetting('missionTitleWeight')) : undefined }}>
                {getSetting('missionTitle') || t('about.new.missionTitle')}
              </h2>
              <p className={styles.missionDesc} style={{ fontWeight: getSetting('missionDescWeight') ? Number(getSetting('missionDescWeight')) : undefined }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(getSetting('missionDesc') || t('about.new.missionDesc')).replace(/\\n/g, '<br/>') }} />
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
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className={styles.articleImage}
                    />
                  </div>
                  <div className={styles.articleContent}>
                    <div className={styles.articleMeta}>
                      <span className={styles.metaDate}>
                        <span className={styles.bullet}>•</span> April 29, 2026
                      </span>
                      <span className={styles.metaCategory}>{isEn ? 'Italy, Culinary' : 'Italia, Kuliner'}</span>
                    </div>
                    <h3 className={styles.articleTitle}>{isEn ? 'Hunting for the Best Budget-Friendly Gelato in Rome' : 'Berburu Gelato Terenak di Roma yang Harganya Ramah Kantong'}</h3>
                    <p className={styles.articleExcerpt}>{isEn ? "Don't get trapped in expensive tourist stalls. Here's the secret to hidden authentic gelaterias..." : 'Jangan sampai kejebak kedai turis yang mahal. Ini bocoran gelateria autentik tersembunyi...'}</p>
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
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className={styles.articleImage}
                    />
                  </div>
                  <div className={styles.articleContent}>
                    <div className={styles.articleMeta}>
                      <span className={styles.metaDate}>
                        <span className={styles.bullet}>•</span> {isEn ? 'June 16, 2026' : 'Juni 16, 2026'}
                      </span>
                      <span className={styles.metaCategory}>{isEn ? 'Italy, Tips' : 'Italia, Tips'}</span>
                    </div>
                    <h3 className={styles.articleTitle}>{isEn ? 'How to Explore Milan in 24 Hours with Only Google Maps' : 'Cara Jitu Keliling Milan 24 Jam Cuma Modal Google Maps'}</h3>
                    <p className={styles.articleExcerpt}>{isEn ? "Only have one day in the fashion capital? Don't panic, here is the most efficient walking route cheat sheet..." : 'Punya waktu seharian doang di kota mode? Gak usah panik, ini contekan rute jalan kaki paling efisien...'}</p>
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
              <div className={styles.guidePill}>{getSetting('guidePill') || t('about.new.guidePill')}</div>
              <h2 className={styles.guideTitle}>{parseGoldText(getSetting('guideTitle') || (isEn ? 'Meet Our *Lead Guide*' : 'Meet Our *Lead Guide*'), styles, getSetting('guideTitleWeight'))}</h2>
              <p className={styles.guideDesc} style={{ fontWeight: getSetting('guideDescWeight') ? Number(getSetting('guideDescWeight')) : undefined }}>
                {getSetting('guideDescP1') || t('about.new.guideDescP1')}<br/><br/>
                {getSetting('guideDescP2') || t('about.new.guideDescP2')}
              </p>
              <Link href="/konsultasi" className={styles.guideBtn}>
                {t('about.new.guideBtn')}
              </Link>
            </div>
            <div className={styles.guideImageWrapper}>
              <div className={styles.guideImageInner}>
                <Image 
                  src={getSetting('guideImage') || "/why-camera.webp"} 
                  alt="Lead Guide"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
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
